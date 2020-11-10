import React from 'react';

import { ToggleButtonGroupInput } from '@spinnaker/core';

import { AwsReactInjector } from 'amazon/reactShims';
import { IAmazonServerGroupCommand } from '../../serverGroupConfiguration.service';

export interface ICpuCreditsToggleProps {
  command: IAmazonServerGroupCommand;
  newInstanceType?: string;
  newProfileType?: string;
  setUnlimitedCpuCredits: (unlimitedCpuCredits: boolean | undefined) => void;
}

export class CpuCreditsToggle extends React.Component<ICpuCreditsToggleProps> {
  private handleInstanceTypeChange() {
    const isBurstingSupported = AwsReactInjector.awsInstanceTypeService.isBurstingSupported(this.props.newInstanceType);
    if (isBurstingSupported) {
      return true;
    }
    this.props.setUnlimitedCpuCredits(undefined);
    return false;
  }

  private handleProfileChange() {
    const instanceType = this.props.command.instanceType;
    const isTypeInProfile = AwsReactInjector.awsInstanceTypeService.isInstanceTypeInCategory(
      instanceType,
      this.props.newProfileType,
    );
    const isBurstingSupported = AwsReactInjector.awsInstanceTypeService.isBurstingSupported(instanceType);
    if (instanceType && isTypeInProfile && isBurstingSupported) {
      return true;
    }
    return false;
  }

  private shouldShow = (): boolean => {
    if (this.props.newInstanceType) {
      return this.handleInstanceTypeChange();
    }

    if (this.props.newProfileType) {
      return this.handleProfileChange();
    }
    return false;
  };

  private handleToggleChange = (state: boolean) => {
    this.props.setUnlimitedCpuCredits(state);
  };

  public render() {
    return (
      <div>
        {this.shouldShow() && (
          <div className="row">
            <ToggleButtonGroupInput
              propLabel={'Unlimited CPU credits '}
              propHelpFieldId={'aws.serverGroup.unlimitedCpuCredits'}
              tooltipPropOffBtn={'Toggle to turn OFF unlimited CPU credits'}
              displayTextPropOffBtn={'Off'}
              tooltipPropOnBtn={'Toggle to turn ON unlimited CPU credits'}
              displayTextPropOnBtn={'On'}
              onClick={this.handleToggleChange}
              isPropertyActive={this.props.command.unlimitedCpuCredits}
            />
          </div>
        )}
      </div>
    );
  }
}
