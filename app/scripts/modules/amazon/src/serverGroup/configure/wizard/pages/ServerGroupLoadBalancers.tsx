import * as React from 'react';
import { Option } from 'react-select';
import { FormikProps } from 'formik';

import { IWizardPageProps, wizardPage, HelpField, TetheredSelect } from '@spinnaker/core';

import { AwsReactInjector } from 'amazon/reactShims';

import { IAmazonServerGroupCommand } from '../../serverGroupConfiguration.service';

export interface IServerGroupLoadBalancersState {
  refreshed: boolean;
  refreshing: boolean;
  showVpcLoadBalancers: boolean;
}

const stringToOption = (value: string): Option<string> => {
  return { value, label: value };
};

class ServerGroupLoadBalancersImpl extends React.Component<
  IWizardPageProps & FormikProps<IAmazonServerGroupCommand>,
  IServerGroupLoadBalancersState
> {
  public static LABEL = 'Load Balancers';

  constructor(props: IWizardPageProps & FormikProps<IAmazonServerGroupCommand>) {
    super(props);

    this.state = {
      refreshing: false,
      refreshed: false,
      showVpcLoadBalancers: false,
    };
  }

  public validate(_values: IAmazonServerGroupCommand): { [key: string]: string } {
    const errors: { [key: string]: string } = {};
    const { values } = this.props;

    if (values.viewState.dirty.targetGroups) {
      errors.targetGroups = 'You must confirm the removed target groups.';
    }
    if (values.viewState.dirty.loadBalancers) {
      errors.loadBalancers = 'You must confirm the removed load balancers.';
    }

    return errors;
  }

  public refreshLoadBalancers(): void {
    this.setState({ refreshing: true });
    AwsReactInjector.awsServerGroupConfigurationService.refreshLoadBalancers(this.props.values).then(() => {
      this.setState({
        refreshing: false,
        refreshed: true,
      });
    });
  }

  public clearWarnings(key: 'loadBalancers' | 'targetGroups'): void {
    this.props.values.viewState.dirty[key] = null;
    this.props.revalidate();
  }

  private targetGroupsChanged = (options: Array<Option<string>>) => {
    const targetGroups = options.map(o => o.value);
    this.props.setFieldValue('targetGroups', targetGroups);
  };

  private loadBalancersChanged = (options: Array<Option<string>>) => {
    const loadBalancers = options.map(o => o.value);
    this.props.setFieldValue('loadBalancers', loadBalancers);
  };

  private vpcLoadBalancersChanged = (options: Array<Option<string>>) => {
    const vpcLoadBalancers = options.map(o => o.value);
    this.props.setFieldValue('vpcLoadBalancers', vpcLoadBalancers);
  };

  public render() {
    const { values } = this.props;
    const { dirty } = values.viewState;
    const { refreshed, refreshing, showVpcLoadBalancers } = this.state;

    const loadBalancerOptions = values.backingData.filtered.loadBalancers
      .concat(values.spelLoadBalancers || [])
      .map(stringToOption);

    const targetGroupOptions = values.backingData.filtered.targetGroups
      .concat(values.spelTargetGroups || [])
      .map(stringToOption);

    const vpcLoadBalancerOptions = values.backingData.filtered.vpcLoadBalancers.map(stringToOption);

    const hasVpcLoadBalancers = values.vpcLoadBalancers && values.vpcLoadBalancers.length > 0;

    // const selectedTargetGroups = values.targetGroups.map(tg => ({ label: tg, value: tg }));
    // const selectedLoadBalancers = values.loadBalancers.map(tg => ({ label: tg, value: tg }));

    return (
      <div className="row">
        {dirty.targetGroups && (
          <div className="col-md-12">
            <div className="alert alert-warning">
              <p>
                <i className="fa fa-exclamation-triangle" />
                The following target groups could not be found in the selected account/region/VPC and were removed:
              </p>
              <ul>{dirty.targetGroups.map(tg => <li key={tg}>{tg}</li>)}</ul>
              <p className="text-right">
                <a
                  className="btn btn-sm btn-default dirty-flag-dismiss clickable"
                  onClick={() => this.clearWarnings('targetGroups')}
                >
                  Okay
                </a>
              </p>
            </div>
          </div>
        )}
        <div className="form-group">
          <div className="col-md-4 sm-label-right">
            <b>Target Groups </b>
            <HelpField id="aws.loadBalancer.targetGroups" />
          </div>
          <div className="col-md-8">
            {targetGroupOptions.length === 0 && (
              <div className="form-control-static">No target groups found in the selected account/region/VPC</div>
            )}
            {targetGroupOptions.length > 0 && (
              <TetheredSelect
                multi={true}
                options={targetGroupOptions}
                value={values.targetGroups}
                onChange={this.targetGroupsChanged}
              />
            )}
          </div>
        </div>

        {dirty.loadBalancers && (
          <div className="col-md-12">
            <div className="alert alert-warning">
              <p>
                <i className="fa fa-exclamation-triangle" />
                The following load balancers could not be found in the selected account/region/VPC and were removed:
              </p>
              <ul>{dirty.loadBalancers.map(lb => <li key={lb}>{lb}</li>)}</ul>
              <p className="text-right">
                <a
                  className="btn btn-sm btn-default dirty-flag-dismiss clickable"
                  onClick={() => this.clearWarnings('loadBalancers')}
                >
                  Okay
                </a>
              </p>
            </div>
          </div>
        )}
        <div className="form-group">
          <div className="col-md-4 sm-label-right">
            <b>Classic Load Balancers </b>
            <HelpField id="aws.loadBalancer.loadBalancers" />
          </div>
          <div className="col-md-8">
            {loadBalancerOptions.length === 0 && (
              <div className="form-control-static">No load balancers found in the selected account/region/VPC</div>
            )}
            {loadBalancerOptions.length > 0 && (
              <TetheredSelect
                multi={true}
                options={loadBalancerOptions}
                value={values.loadBalancers}
                onChange={this.loadBalancersChanged}
              />
            )}
          </div>
        </div>
        {!values.vpcId && (
          <div className="form-group">
            {!hasVpcLoadBalancers &&
              !showVpcLoadBalancers && (
                <div>
                  <div className="col-md-8 col-md-offset-3">
                    <a className="clickable" onClick={() => this.setState({ showVpcLoadBalancers: true })}>
                      Add VPC Load Balancers
                    </a>
                  </div>
                </div>
              )}
            {hasVpcLoadBalancers && (
              <div>
                <div className="col-md-4 sm-label-right">
                  <b>VPC Load Balancers</b>
                </div>
                <div className="col-md-8">
                  {values.backingData.filtered.vpcLoadBalancers.length > 0 && (
                    <TetheredSelect
                      multi={true}
                      options={vpcLoadBalancerOptions}
                      value={values.vpcLoadBalancers}
                      onChange={this.vpcLoadBalancersChanged}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        {refreshed && (
          <div className="form-group small" style={{ marginTop: '20px' }}>
            <div className="col-md-8 col-md-offset-4">
              {refreshing && (
                <p>
                  <span className="fa fa-sync-alt fa-spin" />
                  <span> refreshing...</span>
                </p>
              )}
              {!refreshing && (
                <p>
                  If you are looking for a load balancer or target group from a different application, <br />
                  <a className="clickable" onClick={this.refreshLoadBalancers}>
                    click here
                  </a>
                  to load all load balancers.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
}

export const ServerGroupLoadBalancers = wizardPage(ServerGroupLoadBalancersImpl);
