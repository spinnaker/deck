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
  const multipleInstanceTypesInProps = props.command.launchTemplateOverridesForInstanceType;

  const selectedInstanceTypesMap = new Map<string, IAmazonInstanceTypeOverride>(
    Object.entries(_.keyBy(multipleInstanceTypesInProps, 'instanceType')),
  );

  const [instanceProfile, setInstanceProfile] = useState(props.command.viewState.instanceProfile || 'custom');
  const prevInstanceProfile = usePrevious(instanceProfile);

  const handleProfileChange = (newProfile: string) => {
    setInstanceProfile(newProfile);
    props.setFieldValue('viewState', {
      ...props.command.viewState,
      instanceProfile: newProfile,
    });

    // update instance types on profile change
    const hasProfileChanged = prevInstanceProfile && newProfile && prevInstanceProfile !== newProfile;
    const isInstanceTypesUpdateNeeded =
      newProfile !== 'custom' && multipleInstanceTypesInProps && multipleInstanceTypesInProps.length;
    if (hasProfileChanged && isInstanceTypesUpdateNeeded) {
      const instanceTypesInProfile: string[] = AwsReactInjector.awsInstanceTypeService.getInstanceTypesInCategory(
        multipleInstanceTypesInProps.map((it) => it.instanceType),
        newProfile,
      );
      const newMultipleTypes = multipleInstanceTypesInProps.filter((o) =>
        instanceTypesInProfile.includes(o.instanceType),
      );
      props.setFieldValue('launchTemplateOverridesForInstanceType', newMultipleTypes);
      props.command.instanceTypesChanged(props.command);
    }
  };

  const handleInstanceTypesChange = (types: IAmazonInstanceTypeOverride[]): void => {
    props.setFieldValue('launchTemplateOverridesForInstanceType', types);
    props.command.instanceTypesChanged(props.command);
  };

  if (!(props.instanceTypeDetails && props.instanceTypeDetails.length > 0)) {
    return null;
  }

  return (
    <div className={'advanced-mode-selector'}>
      <InstanceProfileSelector
        currentProfile={instanceProfile}
        handleProfileChange={handleProfileChange}
        instanceProfileList={props.instanceTypeDetails}
      />
      <InstancesDistribution
        onDemandAllocationStrategy={props.command.onDemandAllocationStrategy}
        onDemandBaseCapacity={props.command.onDemandBaseCapacity}
        onDemandPercentageAboveBaseCapacity={props.command.onDemandPercentageAboveBaseCapacity}
        spotAllocationStrategy={props.command.spotAllocationStrategy}
        spotInstancePools={props.command.spotInstancePools}
        spotMaxPrice={props.command.spotPrice}
        setFieldValue={props.setFieldValue}
      />
      <InstanceTypeTable
        currentProfile={instanceProfile}
        selectedInstanceTypesMap={selectedInstanceTypesMap}
        unlimitedCpuCreditsInCmd={props.command.unlimitedCpuCredits}
        profileDetails={props.instanceTypeDetails.find((p) => p.type === instanceProfile)}
        availableInstanceTypesList={
          (props.command.backingData &&
            props.command.backingData.filtered &&
            props.command.backingData.filtered.instanceTypes) ||
          []
        }
        handleInstanceTypesChange={handleInstanceTypesChange}
        setUnlimitedCpuCredits={props.setUnlimitedCpuCredits}
      />
    </div>
  );
}
