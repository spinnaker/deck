import React from 'react';

import { ToggleButtonGroup, ToggleSize } from '@spinnaker/core';

import { AwsReactInjector } from 'amazon/reactShims';
import { IAmazonServerGroupCommand } from '../../serverGroupConfiguration.service';

export interface ICpuCreditsToggleProps {
  command: IAmazonServerGroupCommand;
  newInstanceType?: string;
  newProfileType?: string;
  setUnlimitedCpuCredits: (unlimitedCpuCredits: boolean | undefined) => void;
}

export function CpuCreditsToggle(props: ICpuCreditsToggleProps) {
  const handleInstanceTypeChange = (): boolean => {
    const isBurstingSupported = AwsReactInjector.awsInstanceTypeService.isBurstingSupported(props.newInstanceType);
    if (!isBurstingSupported) {
      props.setUnlimitedCpuCredits(undefined);
    }
    return isBurstingSupported;
  };

  const handleProfileChange = (): boolean => {
    const instanceType = props.command.instanceType;
    const isTypeInProfile = AwsReactInjector.awsInstanceTypeService.isInstanceTypeInCategory(
      instanceType,
      props.newProfileType,
    );
    const isBurstingSupported = AwsReactInjector.awsInstanceTypeService.isBurstingSupported(instanceType);
    if (instanceType && isTypeInProfile && isBurstingSupported) {
      return true;
    }
    return false;
  };

  const handleToggleChange = (state: boolean) => {
    props.setUnlimitedCpuCredits(state);
  };

  let showToggle = false;
  if (props.newInstanceType) {
    showToggle = handleInstanceTypeChange();
  }
  if (props.newProfileType) {
    showToggle = handleProfileChange();
  }

  return (
    <div>
      {showToggle && (
        <div className="row">
          <ToggleButtonGroup
            toggleSize={ToggleSize.XSMALL}
            propLabel={'Unlimited CPU credits '}
            propHelpFieldId={'aws.serverGroup.unlimitedCpuCredits'}
            tooltipPropOffBtn={'Toggle to turn OFF unlimited CPU credits'}
            displayTextPropOffBtn={'Off'}
            tooltipPropOnBtn={'Toggle to turn ON unlimited CPU credits'}
            displayTextPropOnBtn={'On'}
            onClick={handleToggleChange}
            isPropertyActive={props.command.unlimitedCpuCredits}
          />
        </div>
      )}
    </div>
  );
}
