import React from 'react';

import { Tooltip } from 'core/presentation/Tooltip';
import { CloudProviderRegistry } from 'core/cloudProvider';

import './cloudProviderLogo.less';

export interface ICloudProviderLogoProps {
  provider: string;
  height: string;
  width: string;
  showTooltip?: boolean;
}

export interface ICloudProviderLogoState {
  tooltip?: string;
}

export class CloudProviderLogo extends React.Component<ICloudProviderLogoProps, ICloudProviderLogoState> {
  constructor(props: ICloudProviderLogoProps) {
    super(props);
    this.state = this.getState(props);
  }

  private getState(props: ICloudProviderLogoProps): ICloudProviderLogoState {
    if (props.showTooltip) {
      return {
        tooltip: CloudProviderRegistry.getValue(this.props.provider, 'name') || this.props.provider,
      };
    }
    return {};
  }

  public componentWillReceiveProps(nextProps: ICloudProviderLogoProps): void {
    if (nextProps.showTooltip !== this.props.showTooltip) {
      this.setState(this.getState(nextProps));
    }
  }

  public render(): React.ReactElement<CloudProviderLogo> {
    const logo = (
      <span className="cloud-provider-logo">
        <span
          className={`icon icon-${this.props.provider}`}
          style={{ height: this.props.height, width: this.props.width }}
        />
      </span>
    );

    if (this.state.tooltip) {
      return <Tooltip value={this.state.tooltip}>{logo}</Tooltip>;
    } else {
      return logo;
    }
  }
}
