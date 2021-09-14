import React, { useEffect, useState } from 'react';

import { HelpField, IInstanceTypeCategory } from '@spinnaker/core';

import { AdvancedModeSelector } from './advancedMode/AdvancedModeSelector';
import { AWSProviderSettings } from '../../../../aws.settings';
import { IAmazonInstanceTypeOverride, IAmazonServerGroupCommand } from '../../serverGroupConfiguration.service';
import { SimpleModeSelector } from './simpleMode/SimpleModeSelector';

export interface IInstanceTypeSelectorProps {
  command: IAmazonServerGroupCommand;
  setFieldValue: (field: keyof IAmazonServerGroupCommand, value: any, shouldValidate?: boolean) => void;
  instanceTypeDetails: IInstanceTypeCategory[];
}

export function InstanceTypeSelector(props: IInstanceTypeSelectorProps) {
  const isLaunchTemplatesEnabled = AWSProviderSettings.serverGroups?.enableLaunchTemplates;

  const [useSimpleMode, setUseSimpleMode] = React.useState(props.command.viewState.useSimpleInstanceTypeSelector);
  const [unlimitedCpuCredits, setUnlimitedCpuCredits] = useState(props.command.unlimitedCpuCredits);

  useEffect(() => {
    if (props.command.unlimitedCpuCredits !== unlimitedCpuCredits) {
      props.setFieldValue('unlimitedCpuCredits', unlimitedCpuCredits);
    }
  }, [unlimitedCpuCredits]);

  const handleModeChange = (useSimpleModeNew: boolean) => {
    if (useSimpleMode !== useSimpleModeNew) {
      setUseSimpleMode(useSimpleModeNew);

      // update viewState
      props.setFieldValue('viewState', {
        ...props.command.viewState,
        useSimpleInstanceTypeSelector: useSimpleModeNew,
      });

      // update selected instance type(s) if mode changed.
      // Simple mode uses command.instanceType to track selected type. Advanced mode uses command.launchTemplateOverridesForInstanceType to track selected types.
      const multipleInstanceTypesInProps = props.command.launchTemplateOverridesForInstanceType;
      const singleInstanceTypeInProps = props.command.instanceType;

      if (useSimpleModeNew && multipleInstanceTypesInProps && multipleInstanceTypesInProps.length > 0) {
        // advanced mode -> simple mode, pick the instance type with highest priority from command.launchTemplateOverridesForInstanceType
        const highestPriorityNum = Math.min(...multipleInstanceTypesInProps.map((it) => it.priority));
        const instanceTypeWithHighestPriority = multipleInstanceTypesInProps.find(
          (it) => it.priority === highestPriorityNum,
        ).instanceType;

        props.setFieldValue('instanceType', instanceTypeWithHighestPriority);
        props.setFieldValue('launchTemplateOverridesForInstanceType', []);
        props.command.instanceTypeChanged(props.command);
      } else if (!useSimpleModeNew && singleInstanceTypeInProps) {
        // simple mode -> advanced mode, port command.instanceType to command.launchTemplateOverridesForInstanceType
        const instanceTypes: IAmazonInstanceTypeOverride[] = [
          {
            instanceType: singleInstanceTypeInProps,
            priority: 1,
          },
        ];
        props.setFieldValue('launchTemplateOverridesForInstanceType', instanceTypes);
        props.setFieldValue('instanceType', undefined);
        props.command.instanceTypesChanged(props.command);
      }
    }
  };

  // advanced mode is supported only when launch templates support is enabled, so, render the component iff launch templates support is enabled
  if (isLaunchTemplatesEnabled && !useSimpleMode) {
    return (
      <div className="container-fluid form-horizontal" style={{ padding: '0 15px' }}>
        <div>
          <p>
            To configure a single instance type, use
            <a className="clickable" onClick={() => handleModeChange(true)}>
              {' '}
              Simple Mode
            </a>
            .
          </p>
          <i>
            <b>Note:</b> If multiple instance types are already selected in advanced mode, the instance type with
            highest priority will be preserved in simple mode.
          </i>
        </div>
        <AdvancedModeSelector
          command={props.command}
          instanceTypeDetails={props.instanceTypeDetails}
          setUnlimitedCpuCredits={setUnlimitedCpuCredits}
          setFieldValue={props.setFieldValue}
        />
      </div>
    );
  }

  let advancedModeMessage;
  if (isLaunchTemplatesEnabled) {
    advancedModeMessage = (
      <div>
        <p>
          To configure mixed server groups with multiple instance types, use{' '}
          <a className="clickable" onClick={() => handleModeChange(false)}>
            {' '}
            Advanced Mode{' '}
          </a>
        </p>
        <HelpField id={'aws.serverGroup.advancedMode'} />.
        <i>
          <b>Note:</b> If an instance type is already selected in simple mode, it will be preserved in advanced mode.
        </i>
      </div>
    );
  } else {
    advancedModeMessage = (
      <div>
        <p>
          To configure mixed server groups with multiple instance types,{' '}
          <a
            href={
              'https://spinnaker.io/docs/setup/other_config/server-group-launch-settings/aws-ec2/launch-templates-setup/'
            }
          >
            enable launch templates
          </a>{' '}
          and use <a className="disabled"> Advanced Mode </a>
          <HelpField id={'aws.serverGroup.advancedMode'} />.
        </p>
      </div>
    );
  }

  return (
    <div className="container-fluid form-horizontal" style={{ padding: '0 15px' }}>
      {advancedModeMessage}
      <SimpleModeSelector
        command={props.command}
        setUnlimitedCpuCredits={setUnlimitedCpuCredits}
        setFieldValue={props.setFieldValue}
      />
    </div>
  );
}
