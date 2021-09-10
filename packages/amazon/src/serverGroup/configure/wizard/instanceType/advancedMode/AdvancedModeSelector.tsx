import _ from 'lodash';
import React, { useState } from 'react';

import { usePrevious } from '@spinnaker/core';

import { InstanceProfileSelector, InstancesDistribution, InstanceTypeTable } from './common/index';
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

  // build a map of selected instance types with related data for easy access
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

  // mark unavailable instance types for all profiles
  const availableInstanceTypesForConfig: string[] =
    (props.command.backingData &&
      props.command.backingData.filtered &&
      props.command.backingData.filtered.instanceTypes) ||
    [];
  const markedInstanceTypeDetails: IAmazonInstanceTypeCategory[] = Array.from(props.instanceTypeDetails);
  if (!props.command.viewState.disableImageSelection) {
    markedInstanceTypeDetails.forEach((profile) => {
      profile.families.forEach((family) => {
        family.instanceTypes.forEach((instanceType) => {
          instanceType.unavailable = !availableInstanceTypesForConfig.includes(instanceType.name);
        });
      });
    });
  }

  return (
    <div className={'advanced-mode-selector'}>
      <InstanceProfileSelector
        currentProfile={instanceProfile}
        handleProfileChange={handleProfileChange}
        instanceProfileList={markedInstanceTypeDetails}
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
        profileDetails={markedInstanceTypeDetails.find((p) => p.type === instanceProfile)}
        availableInstanceTypesList={availableInstanceTypesForConfig}
        handleInstanceTypesChange={handleInstanceTypesChange}
        setUnlimitedCpuCredits={props.setUnlimitedCpuCredits}
      />
    </div>
  );
}
