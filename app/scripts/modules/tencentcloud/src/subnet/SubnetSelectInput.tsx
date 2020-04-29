import * as React from 'react';
import { Option } from 'react-select';
import { get } from 'lodash';

import {
  Application,
  ISelectInputProps,
  ISubnet,
  Omit,
  SETTINGS,
  SelectInput,
  arePropsEqual,
  createFakeReactSyntheticEvent,
} from '@spinnaker/core';

import { TencentCloudProviderSettings } from 'tencentcloud/tencentcloud.settings';

export interface ISubnetSelectInputProps extends Omit<ISelectInputProps, 'options'> {
  value: string;
  onChange: (event: React.ChangeEvent<any>) => void;
  application: Application;
  readOnly?: boolean;
  hideClassic?: boolean;
  subnets: ISubnet[];
  region: string;
  credentials: string;
}

export interface ISubnetSelectInputState {
  options: Array<Option<string>>;
}

export class SubnetSelectInput extends React.Component<ISubnetSelectInputProps, ISubnetSelectInputState> {
  public state: ISubnetSelectInputState = { options: [] };

  private isClassicLockout(region: string, credentials: string, application: Application): boolean {
    const { classicLaunchLockout, classicLaunchWhitelist: whitelist } = TencentCloudProviderSettings;

    const appCreationDate = Number(get(application, 'attributes.createTs', 0));
    const appCreatedAfterLockout = appCreationDate > (classicLaunchLockout || 0);
    const isWhitelisted = !!whitelist && whitelist.some(e => e.region === region && e.credentials === credentials);
    return appCreatedAfterLockout || !isWhitelisted;
  }

  private getOptions(subnets: ISubnet[], isClassicHidden: boolean): Array<Option<string>> {
    const asOption = (subnet: ISubnet): Option<string> => ({ label: `${subnet.name}(${subnet.id})`, value: subnet.id });

    const classicOption = isClassicHidden ? [] : [{ label: 'None ', value: '' } as Option];

    const activeOptions = subnets.filter(x => !x.deprecated).map(asOption);

    const deprecatedOptions = subnets.filter(x => x.deprecated).map(asOption);

    if (deprecatedOptions.length) {
      deprecatedOptions.unshift({ label: '-----------', value: '', disabled: true });
    }

    return classicOption.concat(activeOptions).concat(deprecatedOptions) as Array<Option<string>>;
  }

  private updateOptions() {
    const { value, hideClassic, subnets, region, credentials, application } = this.props;
    const isClassicHidden = hideClassic || this.isClassicLockout(region, credentials, application);
    const options = this.getOptions(subnets, isClassicHidden);

    this.setState({ options });

    if (!value) {
      this.applyDefaultSubnet();
    }
  }

  public componentDidMount() {
    this.updateOptions();
  }

  public componentDidUpdate(prevProps: ISubnetSelectInputProps): void {
    if (!arePropsEqual(this.props, prevProps, ['hideClassic', 'subnets', 'region', 'credentials', 'application'])) {
      this.updateOptions();
    }
  }

  public applyDefaultSubnet() {
    const { value, onChange, subnets } = this.props;
    const defaultSubnetType = get(SETTINGS, 'providers.tencentcloud.defaults.subnetType');
    const defaultSubnet = subnets.find(subnet => defaultSubnetType === subnet.name) || subnets[0];
    if (!value && defaultSubnet) {
      onChange(createFakeReactSyntheticEvent({ name, value: defaultSubnet.id }));
    }
  }

  public render() {
    const { readOnly, ...otherProps } = this.props;

    if (readOnly) {
      return <p className="form-control-static">{this.props.value || 'None '}</p>;
    }

    return <SelectInput options={this.state.options} {...otherProps} />;
  }
}
