import React from 'react';

import { Tooltip } from 'core/presentation/Tooltip';
import { CloudProviderRegistry } from './CloudProviderRegistry';

import './cloudProviderLogo.less';

export interface ICloudProviderLogoProps {
  provider: string;
  height: string;
  width: string;
  showTooltip?: boolean;
}

export interface ICloudProviderLogoState {
  tooltip?: string;
  logo: React.ComponentType<React.SVGProps<HTMLOrSVGElement>>;
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
        logo: CloudProviderRegistry.getValue(this.props.provider, 'cloudProviderLogo'),
      };
    }
    return {
      logo: CloudProviderRegistry.getValue(this.props.provider, 'cloudProviderLogo'),
    };
  }

  public componentWillReceiveProps(nextProps: ICloudProviderLogoProps): void {
    if (nextProps.showTooltip !== this.props.showTooltip) {
      this.setState(this.getState(nextProps));
    }
  }

  public render(): React.ReactElement<CloudProviderLogo> {
    const RegistryLogo = this.state.logo;
    const ProviderLogo = RegistryLogo ? (
      <RegistryLogo height={this.props.height} width={this.props.width} />
    ) : (
      <span
        className={`icon icon-${this.props.provider}`}
        style={{ height: this.props.height, width: this.props.width }}
      />
    );

    if (this.state.tooltip) {
      return <Tooltip value={this.state.tooltip}>{ProviderLogo}</Tooltip>;
    }

    return <span className="cloud-provider-logo">{ProviderLogo}</span>;
  }
}
