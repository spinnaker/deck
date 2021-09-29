import React, { useEffect, useState } from 'react';
import { ToggleButtonGroup, ToggleSize } from '@spinnaker/core';
import { AwsReactInjector } from '../../../../reactShims';

export interface ICpuCreditsToggleProps {
  unlimitedCpuCredits?: boolean;
  selectedInstanceTypes: string[];
  currentProfile: string;
  setUnlimitedCpuCredits: (unlimitedCpuCredits: boolean | undefined) => void;
}

export function CpuCreditsToggle(props: ICpuCreditsToggleProps) {
  const isBurstingSupportedForAllTypes = AwsReactInjector.awsInstanceTypeService.isBurstingSupportedForAllTypes(
    props.selectedInstanceTypes,
  );
  const isAtleastOneTypeInProfile = AwsReactInjector.awsInstanceTypeService.getInstanceTypesInCategory(
    props.selectedInstanceTypes,
    props.currentProfile,
  ).length
    ? true
    : false;

  const [showToggle, setShowToggle] = useState(false);
  useEffect(() => {
    if (props.selectedInstanceTypes && props.selectedInstanceTypes.length) {
      if (!isBurstingSupportedForAllTypes) {
        props.setUnlimitedCpuCredits(undefined);
      }
      setShowToggle(isBurstingSupportedForAllTypes);
    }

    if (props.currentProfile) {
      setShowToggle(
        props.selectedInstanceTypes &&
          props.selectedInstanceTypes.length > 0 &&
          isBurstingSupportedForAllTypes &&
          isAtleastOneTypeInProfile,
      );
    }
  }, [props.currentProfile, props.selectedInstanceTypes]);

  return (
    <div className={'row'} style={{ fontSize: '110%' }}>
      {showToggle && (
        <div>
          <ToggleButtonGroup
            toggleSize={ToggleSize.XSMALL}
            propLabel={'Unlimited CPU credits '}
            propHelpFieldId={'aws.serverGroup.unlimitedCpuCredits'}
            tooltipPropOffBtn={'Toggle to turn OFF unlimited CPU credits'}
            displayTextPropOffBtn={'Off'}
            tooltipPropOnBtn={'Toggle to turn ON unlimited CPU credits'}
            displayTextPropOnBtn={'On'}
            onClick={(b) => props.setUnlimitedCpuCredits(b)}
            isPropertyActive={props.unlimitedCpuCredits}
          />
        </div>
      )}
    </div>
  );
}
