import _ from 'lodash';
import React, { useState } from 'react';

import { usePrevious } from '@spinnaker/core';

import { InstanceProfileSelector } from './InstanceProfileSelector';
import { InstanceTypeTable } from './InstanceTypeTable';
import { InstancesDistribution } from './InstancesDistribution';
import { IAmazonInstanceTypeCategory } from '../../../../../instance/awsInstanceType.service';
import { AwsReactInjector } from '../../../../../reactShims';
import { IAmazonInstanceTypeOverride, IAmazonServerGroupCommand } from '../../../serverGroupConfiguration.service';

export interface IAdvancedModeSelectorProps {
  command: IAmazonServerGroupCommand;
  instanceTypeDetails: IAmazonInstanceTypeCategory[];
  setUnlimitedCpuCredits: (unlimitedCpuCredits: boolean | undefined) => void;
  setFieldValue: (field: keyof IAmazonServerGroupCommand, value: any, shouldValidate?: boolean) => void;
}

/**
 * Note: Launch templates support is expected to be enabled if this component is rendered.
 */
export function AdvancedModeSelector(props: IAdvancedModeSelectorProps) {
  const { command, instanceTypeDetails, setUnlimitedCpuCredits, setFieldValue } = props;
  const instanceTypesInProps: IAmazonInstanceTypeOverride[] = command.launchTemplateOverridesForInstanceType
    ? command.launchTemplateOverridesForInstanceType
    : [{ instanceType: command.instanceType }]; // needed for the case of MixedInstancesPolicy without overrides

  const selectedInstanceTypesMap = new Map<string, IAmazonInstanceTypeOverride>(
    Object.entries(_.keyBy(instanceTypesInProps, 'instanceType')),
  );

  const [instanceProfile, setInstanceProfile] = useState(command.viewState.instanceProfile || 'custom');
  const prevInstanceProfile = usePrevious(instanceProfile);

  const handleProfileChange = (newProfile: string) => {
    setInstanceProfile(newProfile);
    setFieldValue('viewState', {
      ...command.viewState,
      instanceProfile: newProfile,
    });

    // update instance types on profile change
    const hasProfileChanged = prevInstanceProfile && newProfile && prevInstanceProfile !== newProfile;
    const isInstanceTypesUpdateNeeded = newProfile !== 'custom' && instanceTypesInProps && instanceTypesInProps.length;
    if (hasProfileChanged && isInstanceTypesUpdateNeeded) {
      const instanceTypesInProfile: string[] = AwsReactInjector.awsInstanceTypeService.getInstanceTypesInCategory(
        instanceTypesInProps.map((it) => it.instanceType),
        newProfile,
      );
      const newMultipleTypes = instanceTypesInProps.filter((o) => instanceTypesInProfile.includes(o.instanceType));
      setFieldValue('launchTemplateOverridesForInstanceType', newMultipleTypes);
      command.launchTemplateOverridesChanged(command);
    }
  };

  const handleInstanceTypesChange = (types: IAmazonInstanceTypeOverride[]): void => {
    setFieldValue('launchTemplateOverridesForInstanceType', types);
    command.launchTemplateOverridesChanged(command);
  };

  if (!(instanceTypeDetails && instanceTypeDetails.length > 0)) {
    return null;
  }

  return (
    <div className={'advanced-mode-selector'}>
      <InstanceProfileSelector
        currentProfile={instanceProfile}
        handleProfileChange={handleProfileChange}
        instanceProfileList={instanceTypeDetails}
      />
      <InstancesDistribution
        onDemandAllocationStrategy={command.onDemandAllocationStrategy}
        onDemandBaseCapacity={command.onDemandBaseCapacity}
        onDemandPercentageAboveBaseCapacity={command.onDemandPercentageAboveBaseCapacity}
        spotAllocationStrategy={command.spotAllocationStrategy}
        spotInstancePools={command.spotInstancePools}
        spotMaxPrice={command.spotPrice}
        setFieldValue={setFieldValue}
      />
      <InstanceTypeTable
        currentProfile={instanceProfile}
        selectedInstanceTypesMap={selectedInstanceTypesMap}
        unlimitedCpuCreditsInCmd={command.unlimitedCpuCredits}
        profileDetails={instanceTypeDetails.find((p) => p.type === instanceProfile)}
        availableInstanceTypesList={
          (command.backingData && command.backingData.filtered && command.backingData.filtered.instanceTypes) || []
        }
        handleInstanceTypesChange={handleInstanceTypesChange}
        setUnlimitedCpuCredits={setUnlimitedCpuCredits}
      />
    </div>
  );
}
