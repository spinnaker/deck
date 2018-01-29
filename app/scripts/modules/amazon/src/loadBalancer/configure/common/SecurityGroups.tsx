import * as React from 'react';
import { IPromise } from 'angular';
import { filter, get, isEqual, map, uniq } from 'lodash';
import { BindAll } from 'lodash-decorators';
import { FormikProps } from 'formik';
import VirtualizedSelect from 'react-virtualized-select';
import { Observable, Subject } from 'rxjs';

import {
  ISecurityGroup,
  ISecurityGroupsByAccountSourceData,
  IWizardPageProps,
  ReactInjector,
  Spinner,
  timestamp,
  wizardPage
} from '@spinnaker/core';

import { AWSProviderSettings } from 'amazon/aws.settings';
import { IAmazonClassicLoadBalancerUpsertCommand } from 'amazon/domain';

export interface ISecurityGroupsState {
  availableSecurityGroups: { label: string, value: string }[];
  defaultSecurityGroups: string[];
  loaded: boolean;
  refreshing: boolean;
  removed: string[];
  refreshTime: number;
}

@BindAll()
class SecurityGroupsImpl extends React.Component<IWizardPageProps & FormikProps<IAmazonClassicLoadBalancerUpsertCommand>, ISecurityGroupsState> {
  public static LABEL = 'Security Groups';

  private destroy$ = new Subject();

  constructor(props: IWizardPageProps & FormikProps<IAmazonClassicLoadBalancerUpsertCommand>) {
    super(props);

    const defaultSecurityGroups = get<string[]>(AWSProviderSettings, 'defaultSecurityGroups', []);
    this.state = {
      availableSecurityGroups: [],
      defaultSecurityGroups,
      loaded: false,
      refreshing: false,
      removed: [],
      refreshTime: ReactInjector.infrastructureCaches.get('securityGroups').getStats().ageMax,
    }
  }

  public validate(): { [key: string]: string } {
    return {};
  }

  private clearRemoved(): void {
    this.props.dirtyCallback(SecurityGroups.label, false);
    this.setState({ removed: [] });
  }

  private preloadSecurityGroups(): IPromise<ISecurityGroupsByAccountSourceData> {
    return ReactInjector.securityGroupReader.getAllSecurityGroups().then((securityGroups) => {
      this.setState({
        loaded: true,
      });
      return securityGroups;
    });
  }

  private availableGroupsSorter(a: ISecurityGroup, b: ISecurityGroup): number {
    const { securityGroups } = this.props.values;
    const { defaultSecurityGroups } = this.state;

    if (defaultSecurityGroups) {
      if (defaultSecurityGroups.includes(a.name)) {
        return -1;
      }
      if (defaultSecurityGroups.includes(b.name)) {
        return 1;
      }
    }
    return securityGroups.includes(a.id) ? -1 : securityGroups.includes(b.id) ? 1 : 0;
  }

  private updateAvailableSecurityGroups(availableVpcIds: string[], allSecurityGroups: ISecurityGroupsByAccountSourceData): void {
    const { credentials: account, region, securityGroups } = this.props.values;
    const { defaultSecurityGroups, removed } = this.state;

    const newRemoved = removed.slice();

    let availableSecurityGroups: { label: string, value: string }[] = [];

    if (account && region && allSecurityGroups && allSecurityGroups[account] && allSecurityGroups[account].aws[region]) {
      const regionalSecurityGroups = filter(allSecurityGroups[account].aws[region], (securityGroup) => {
        return availableVpcIds.includes(securityGroup.vpcId);
      }).sort((a, b) => this.availableGroupsSorter(a, b)); // push existing groups to top
      const existingSecurityGroupNames = map(regionalSecurityGroups, 'name');
      const existingNames = defaultSecurityGroups.filter((name) => existingSecurityGroupNames.includes(name));
      securityGroups.forEach((securityGroup) => {
        if (!existingSecurityGroupNames.includes(securityGroup)) {
          const matches = filter(regionalSecurityGroups, { id: securityGroup });
          if (matches.length) {
            existingNames.push(matches[0].name);
          } else {
            if (defaultSecurityGroups.includes(securityGroup)) {
              newRemoved.push(securityGroup);
            }
          }
        } else {
          existingNames.push(securityGroup);
        }
      });
      const updatedSecurityGroups = uniq(existingNames);
      if (newRemoved.length) {
        this.props.dirtyCallback(SecurityGroups.label, true);
      }

      availableSecurityGroups = regionalSecurityGroups.map((sg) => {
        return { label: `${sg.name} (${sg.id})`, value: sg.name };
      });

      if (!isEqual(updatedSecurityGroups, securityGroups)) {
        this.props.setFieldValue('securityGroups', updatedSecurityGroups);
      }
    }
    this.setState({ availableSecurityGroups, removed: newRemoved });
  }

  private refreshSecurityGroups(): void {
    this.setState({ refreshing: true });

    Observable.fromPromise(ReactInjector.cacheInitializer.refreshCache('securityGroups'))
      .takeUntil(this.destroy$)
      .subscribe(() => {
        this.setState({
          refreshing: false,
          refreshTime: ReactInjector.infrastructureCaches.get('securityGroups').getStats().ageMax,
        });

        Observable.fromPromise(this.preloadSecurityGroups())
          .takeUntil(this.destroy$)
          .subscribe((securityGroups) => {
            this.updateAvailableSecurityGroups([this.props.values.vpcId], securityGroups);
          });
      });
  };

  private handleSecurityGroupsChanged(newValues: { label: string, value: string }[]): void {
    this.props.setFieldValue('securityGroups', newValues.map((sg) => sg.value));
  }

  public componentDidMount(): void {
    this.refreshSecurityGroups();
  }

  public componentWillUnmount() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public render() {
    const { securityGroups } = this.props.values;
    const { availableSecurityGroups, loaded, refreshing, removed, refreshTime } = this.state;

    return (
      <div className="container-fluid form-horizontal">
        <div>
          { removed.length > 0 && (
            <div className="form-group">
              <div className="col-md-12">
                <div className="alert alert-warning">
                  <p><i className="fa fa-exclamation-triangle"/>
                    The following security groups could not be found in the selected account/region/VPC and were removed:
                  </p>
                  <ul>
                    {removed.map((sg) => <li key={sg}>{sg}</li>)}
                  </ul>
                  <p className="text-right">
                    <a className="btn btn-sm btn-default dirty-flag-dismiss clickable" onClick={this.clearRemoved}>Okay</a>
                  </p>
                </div>
              </div>
            </div>
          )}
          <div className="form-group">
            <div className="col-md-3 sm-label-right">Security Groups</div>
            <div className="col-md-9">
              {!loaded && <div style={{ paddingTop: '13px' }}><Spinner size="small"/></div>}
              {loaded && (
                <VirtualizedSelect
                  // className=""
                  multi={true}
                  value={securityGroups}
                  options={availableSecurityGroups}
                  onChange={this.handleSecurityGroupsChanged}
                />
              )}
            </div>
          </div>

          <div className="form-group small" style={{ marginTop: '20px' }}>
            <div className="col-md-9 col-md-offset-3">
              <p>
                {refreshing && <span><span className="fa fa-refresh fa-spin"/> </span>}
                Security groups
                {!refreshing && <span> last refreshed {timestamp(refreshTime)}</span>}
                {refreshing && <span> refreshing...</span>}
              </p>
              <p>If you're not finding a security group that was recently added, <a className="clickable" onClick={this.refreshSecurityGroups}>click here</a> to refresh the list.</p>
            </div>
          </div>
        </div>
    </div>
    );
  }
};

export const SecurityGroups = wizardPage(SecurityGroupsImpl);
