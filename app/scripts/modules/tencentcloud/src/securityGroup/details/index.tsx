import * as React from 'react';
import { isEmpty } from 'lodash';
import { UISref } from '@uirouter/react';

import {
  RecentHistoryService,
  FirewallLabels,
  ReactInjector,
  Application,
  Details,
  CollapsibleSection,
  AccountTag,
} from '@spinnaker/core';

import { SecurityGroupActions } from './SecurityGroupActions';

import { ISecurityGroupDetail } from '../define';

interface ISecurityGroupDetailProps {
  app: Application;
  resolvedSecurityGroup: ISecurityGroupDetail;
}
interface ISecurityGroupDetailState {
  loading: boolean;
  notFound: boolean;
  securityGroup: ISecurityGroupDetail;
}

export class SecurityGroupDetail extends React.Component<ISecurityGroupDetailProps, ISecurityGroupDetailState> {
  constructor(props: ISecurityGroupDetailProps) {
    super(props);
  }
  state = {
    loading: true,
    notFound: false,
    securityGroup: this.props.resolvedSecurityGroup,
  };
  private group = '';
  private _isUnmounted = false;
  componentDidMount() {
    const { app } = this.props;
    this.extractSecurityGroup().then(() => {
      if (!this._isUnmounted && !app.isStandalone) {
        app.securityGroups.onRefresh(null, this.extractSecurityGroup);
      }
    });
  }
  public componentWillUnmount(): void {
    this._isUnmounted = true;
  }
  private extractSecurityGroup = () => {
    const { app } = this.props;
    const { accountId, provider, region, vpcId, name } = this.state.securityGroup || {};
    return ReactInjector.securityGroupReader
      .getSecurityGroupDetails(app, accountId, provider, region, vpcId, name)
      .then(details => {
        this.setState({
          loading: false,
        });
        if (!details || isEmpty(details)) {
          this.fourOhFour();
        } else {
          const applicationSecurityGroup = ReactInjector.securityGroupReader.getApplicationSecurityGroup(
            app,
            accountId,
            region,
            name,
          );
          this.setState({
            securityGroup: Object.assign(this.state.securityGroup, applicationSecurityGroup, details),
          });
        }
      }, this.fourOhFour);
  };

  fourOhFour() {
    if (this._isUnmounted) {
      return;
    }
    const { app } = this.props;

    if (app.isStandalone) {
      this.group = this.state.securityGroup.name;
      this.setState({
        notFound: true,
        loading: false,
      });
      RecentHistoryService.removeLastItem('securityGroups');
    } else {
      ReactInjector.$state.go('^', { allowModalToStayOpen: true }, { location: 'replace' });
    }
  }
  public render() {
    const { notFound, loading, securityGroup } = this.state;
    const { app } = this.props;
    return (
      <>
        {notFound ? (
          <section>
            <h3>
              Could not find {FirewallLabels.get('Firewall')} {this.group}.
            </h3>
            <UISref to="home.infrastructure">
              <a>Back to search results</a>
            </UISref>
          </section>
        ) : (
          // @ts-ignore
          <Details loading={loading}>
            <Details.Header
              name={securityGroup.name || '(not found)'}
              icon={<i className="glyphicon glyphicon-transfer" />}
            >
              <div className="actions">
                <SecurityGroupActions application={app} securityGroup={securityGroup} />
              </div>
            </Details.Header>
            <div className="content">
              {
                // @ts-ignore
                <CollapsibleSection heading={`${FirewallLabels.get('Firewall')} Details`} expanded>
                  <dl className="dl-horizontal dl-medium">
                    <dt>ID</dt>
                    <dd>{securityGroup.id}</dd>
                    <dt>Account</dt>
                    <dd>
                      {
                        // @ts-ignore
                        <AccountTag account={securityGroup.accountName} />
                      }
                    </dd>
                    <dt>Region</dt>
                    <dd>{securityGroup.region}</dd>
                    <dt>Description</dt>
                    <dd>{securityGroup.description}</dd>
                  </dl>
                </CollapsibleSection>
              }
              {!!securityGroup.inRules && (
                // @ts-ignore
                <CollapsibleSection
                  defaultExpanded={securityGroup.inRules.length > 0}
                  heading={`${FirewallLabels.get('Firewall')} Rules ${securityGroup.inRules.length || 0}`}
                >
                  {securityGroup.inRules.length === 0 ? (
                    <div>None</div>
                  ) : (
                    securityGroup.inRules.map(rule => (
                      <dl className="dl-horizontal dl-medium" key={rule.index}>
                        <dt>Source</dt>
                        <dd>{rule.cidrBlock}</dd>
                        <dt>Policy</dt>
                        <dd>{rule.action}</dd>
                        <dt>Protocol Port</dt>
                        <dd>
                          {rule.protocol}: {rule.port}
                        </dd>
                      </dl>
                    ))
                  )}
                </CollapsibleSection>
              )}
            </div>
          </Details>
        )}
      </>
    );
  }
}
