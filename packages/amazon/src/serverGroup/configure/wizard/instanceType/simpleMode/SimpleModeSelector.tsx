import React from 'react';

import { NgReact } from '@spinnaker/core';

import { CpuCreditsToggle } from '../CpuCreditsToggle';
import { AWSProviderSettings } from '../../../../../aws.settings';
import { IAmazonServerGroupCommand } from '../../../serverGroupConfiguration.service';

export interface ISimpleModeSelectorProps {
  command: IAmazonServerGroupCommand;
  setUnlimitedCpuCredits: (unlimitedCpuCredits: boolean | undefined) => void;
  setFieldValue: (field: keyof IAmazonServerGroupCommand, value: any, shouldValidate?: boolean) => void;
}

export function SimpleModeSelector(props: ISimpleModeSelectorProps) {
  const { InstanceArchetypeSelector, InstanceTypeSelector } = NgReact;
  const isLaunchTemplatesEnabled = AWSProviderSettings.serverGroups?.enableLaunchTemplates;
  const isCpuCreditsEnabled = AWSProviderSettings.serverGroups?.enableCpuCredits;

  const instanceProfileChanged = (newProfile: string) => {
    // Instance profile is already set on values.viewState, so just use that value.
    // Once angular is gone from this component tree, we can move all the viewState stuff
    // into react state
    props.setFieldValue('viewState', {
      ...props.command.viewState,
      instanceProfile: newProfile,
    });
  };

  const instanceTypeChanged = (type: string) => {
    props.command.instanceTypeChanged(props.command);
    props.setFieldValue('instanceType', type);
  };

  return (
    <div className="container-fluid form-horizontal">
      <div className="row">
        <InstanceArchetypeSelector
          command={props.command}
          onTypeChanged={instanceTypeChanged}
          onProfileChanged={instanceProfileChanged}
        />
        <div style={{ padding: '0 15px' }}>
          {props.command.viewState.instanceProfile && props.command.viewState.instanceProfile !== 'custom' && (
            <InstanceTypeSelector command={props.command} onTypeChanged={instanceTypeChanged} />
          )}
        </div>
      </div>
      {isLaunchTemplatesEnabled && isCpuCreditsEnabled && (
        <div className="row">
          <CpuCreditsToggle
            unlimitedCpuCredits={props.command.unlimitedCpuCredits}
            selectedInstanceTypes={[props.command.instanceType]}
            currentProfile={props.command.viewState.instanceProfile}
            setUnlimitedCpuCredits={props.setUnlimitedCpuCredits}
          />
        </div>
      )}
    </div>
  );
}
