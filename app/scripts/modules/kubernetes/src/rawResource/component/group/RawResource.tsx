import React from 'react';
import { UISref, UISrefActive } from '@uirouter/react';
import { CloudProviderLogo } from '@spinnaker/core';
import './RawResource.less';
import { RawResourceUtils } from '../RawResourceUtils';

interface IRawResourceProps {
  resource: IApiKubernetesResource;
}

interface IRawResourceState {}

export class RawResource extends React.Component<IRawResourceProps, IRawResourceState> {
  constructor(props: IRawResourceProps) {
    super(props);
  }

  public render() {
    const key =
      this.props.resource.account +
      '-' +
      this.props.resource.namespace +
      '-' +
      this.props.resource.kind +
      '-' +
      this.props.resource.displayName;
    const params = {
      account: this.props.resource.account,
      name: this.props.resource.name,
      region: this.props.resource.region,
    };
    return (
      <UISrefActive class="active">
        <UISref to=".rawResourceDetails" params={params}>
          <div id={key} className="raw-resource-card clickable clickable-row">
            <h4 className="raw-resource-title">
              <CloudProviderLogo provider="kubernetes" height="20px" width="20px" />
              {this.props.resource.kind} {this.props.resource.displayName}
            </h4>
            <div className="raw-resource-details">
              <div className="raw-resource-details-column">
                <div className="raw-resource-details-column-label">account:</div>
                <div>{this.props.resource.account}</div>
              </div>
              <div className="raw-resource-details-column">
                <div className="raw-resource-details-column-label">namespace:</div>
                <div>{RawResourceUtils.namespaceDisplayName(this.props.resource.namespace)}</div>
              </div>
              <div className="raw-resource-details-column">
                <div className="raw-resource-details-column-label">apiVersion:</div>
                <div>{this.props.resource.apiVersion}</div>
              </div>
            </div>
          </div>
        </UISref>
      </UISrefActive>
    );
  }
}
