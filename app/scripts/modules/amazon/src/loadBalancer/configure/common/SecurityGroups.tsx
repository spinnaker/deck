import * as React from 'react';
import { IPromise } from 'angular';
import { get, isEqual, uniq, partition } from 'lodash';
import VirtualizedSelect from 'react-virtualized-select';
import { Observable, Subject } from 'rxjs';

import {
  InfrastructureCaches,
  ISecurityGroup,
  ISecurityGroupsByAccountSourceData,
  IWizardPageProps,
  ReactInjector,
  Spinner,
  timestamp,
  wizardPage,
  FirewallLabels,
} from '@spinnaker/core';

import { AWSProviderSettings } from 'amazon/aws.settings';
import { IAmazonLoadBalancerUpsertCommand } from 'amazon/domain';

export interface ISecurityGroupsProps extends IWizardPageProps<IAmazonLoadBalancerUpsertCommand> {
  isNew?: boolean;
}

export interface ISecurityGroupsState {
  availableSecurityGroups: Array<{ label: string; value: string }>;
  defaultSecurityGroups: string[];
  loaded: boolean;
  refreshing: boolean;
  removed: string[];
  refreshTime: number;
}

class SecurityGroupsImpl extends React.Component<ISecurityGroupsProps, ISecurityGroupsState> {
  public static get LABEL() {
    return FirewallLabels.get('Firewalls');
  }

  private destroy$ = new Subject();

  constructor(props: ISecurityGroupsProps) {
    super(props);

    const defaultSecurityGroups = get<string[]>(AWSProviderSettings, 'defaultSecurityGroups', []);
    this.state = {
      availableSecurityGroups: [],
      defaultSecurityGroups,
      loaded: false,
      refreshing: false,
      removed: [],
      refreshTime: InfrastructureCaches.get('securityGroups').getStats().ageMax,
    };
  }

  public validate() {
    const { removed } = this.state;
    if (removed && removed.length) {
      const label = FirewallLabels.get('Firewalls');
      return { securityGroupsRemoved: `${label} removed: ${removed.join(', ')}` };
    }
    return {};
  }

  private clearRemoved = (): void => {
    this.setState({ removed: [] }, () => this.props.formik.validateForm());
  };

  private preloadSecurityGroups(): IPromise<ISecurityGroupsByAccountSourceData> {
    return ReactInjector.securityGroupReader.getAllSecurityGroups().then(securityGroups => {
      this.setState({ loaded: true });
      return securityGroups;
    });
  }

  private updateRemovedSecurityGroups(selectedGroups: string[], availableGroups: ISecurityGroup[]): void {
    const { isNew } = this.props;
    const { defaultSecurityGroups, removed } = this.state;

    const getDesiredGroupNames = (): string[] => {
      const desired = selectedGroups.concat(removed).sort();
      const defaults = isNew ? defaultSecurityGroups : [];
      return uniq(defaults.concat(desired));
    };

    const getAvailableSecurityGroup = (name: string) => availableGroups.find(sg => sg.name === name || sg.id === name);

    // Organize selected security groups into available/not available
    const [available, notAvailable] = partition(getDesiredGroupNames(), name => !!getAvailableSecurityGroup(name));

    // Normalize available security groups from [name or id] to name
    const securityGroups = available.map(name => getAvailableSecurityGroup(name).name);
    if (!isEqual(selectedGroups, securityGroups)) {
      this.props.formik.setFieldValue('securityGroups', securityGroups);
    }
    this.setState({ removed: notAvailable }, () => this.props.formik.validateForm());
  }

  private refreshSecurityGroups = (): void => {
    this.setState({ refreshing: true });
    this.props.setWaiting(SecurityGroups.label, true);

    Observable.fromPromise(ReactInjector.cacheInitializer.refreshCache('securityGroups'))
      .takeUntil(this.destroy$)
      .subscribe(() => {
        this.setState({
          refreshing: false,
          refreshTime: InfrastructureCaches.get('securityGroups').getStats().ageMax,
        });
        this.props.setWaiting(SecurityGroups.label, false);

        Observable.fromPromise(this.preloadSecurityGroups())
          .takeUntil(this.destroy$)
          .subscribe(allSecurityGroups => {
            const { credentials: account, region, vpcId, securityGroups } = this.props.formik.values;
            const forAccount = allSecurityGroups[account] || {};
            const forRegion = (forAccount.aws && forAccount.aws[region]) || [];
            const availableSecurityGroups = forRegion.filter(securityGroup => securityGroup.vpcId === vpcId).sort();
            const makeOption = (sg: ISecurityGroup) => ({ label: `${sg.name} (${sg.id})`, value: sg.name });

            this.setState({ availableSecurityGroups: availableSecurityGroups.map(makeOption) });
            this.updateRemovedSecurityGroups(securityGroups, availableSecurityGroups);
          });
      });
  };

  private handleSecurityGroupsChanged = (newValues: Array<{ label: string; value: string }>): void => {
    this.props.formik.setFieldValue('securityGroups', newValues.map(sg => sg.value));
  };

  public componentDidMount(): void {
    this.refreshSecurityGroups();
  }

  public componentWillUnmount() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public render() {
    const { securityGroups } = this.props.formik.values;
    const { availableSecurityGroups, loaded, refreshing, removed, refreshTime } = this.state;

    return (
      <div className="container-fluid form-horizontal">
        <div>
          {removed.length > 0 && (
            <div className="form-group">
              <div className="col-md-12">
                <div className="alert alert-warning">
                  <p>
                    <i className="fa fa-exclamation-triangle" />
                    The following {FirewallLabels.get('firewalls')} could not be found in the selected
                    account/region/VPC and were removed:
                  </p>
                  <ul>
                    {removed.map(sg => (
                      <li key={sg}>{sg}</li>
                    ))}
                  </ul>
                  <p className="text-right">
                    <a className="btn btn-sm btn-default dirty-flag-dismiss clickable" onClick={this.clearRemoved}>
                      Okay
                    </a>
                  </p>
                </div>
              </div>
            </div>
          )}
          <div className="form-group">
            <div className="col-md-3 sm-label-right">{FirewallLabels.get('Firewalls')}</div>
            <div className="col-md-9">
              {!loaded && (
                <div style={{ paddingTop: '13px' }}>
                  <Spinner size="small" />
                </div>
              )}
              {loaded && (
                <VirtualizedSelect
                  // className=""
                  multi={true}
                  value={securityGroups}
                  options={availableSecurityGroups}
                  onChange={this.handleSecurityGroupsChanged}
                  clearable={false}
                />
              )}
            </div>
          </div>

          <div className="form-group small" style={{ marginTop: '20px' }}>
            <div className="col-md-9 col-md-offset-3">
              <p>
                {refreshing && (
                  <span>
                    <span className="fa fa-sync-alt fa-spin" />{' '}
                  </span>
                )}
                {FirewallLabels.get('Firewalls')}
                {!refreshing && <span> last refreshed {timestamp(refreshTime)}</span>}
                {refreshing && <span> refreshing...</span>}
              </p>
              <p>
                If you're not finding a {FirewallLabels.get('firewall')} that was recently added,{' '}
                <a className="clickable" onClick={this.refreshSecurityGroups}>
                  click here
                </a>{' '}
                to refresh the list.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export const SecurityGroups = wizardPage(SecurityGroupsImpl);
