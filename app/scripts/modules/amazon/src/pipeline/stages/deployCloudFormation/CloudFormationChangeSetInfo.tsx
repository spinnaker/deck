import React, { useState } from 'react';
import { module } from 'angular';
import { react2angular } from 'react2angular';

import {
  StageConfigField,
  TextInput,
  CheckboxInput,
  ReactSelectInput,
  IStage,
  IStageConfigProps,
} from '@spinnaker/core';

export interface ICloudFormationChangeSetInfoProps {
  stage: IStage[];
  stageconfig: IStageConfigProps;
}

export const CloudFormationChangeSetInfo = (props: ICloudFormationChangeSetInfoProps) => {
  const randomString = Math.random()
    .toString(36)
    .substring(2, 10)
    .toUpperCase();

  const { stage, stageconfig } = props;
  const [changeSetName, setChangeSetName] = useState(
    stage.changeSetName ? stage.changeSetName : 'ChangeSet-' + randomString,
  );
  const [executeChangeSet, setExecuteChangeSet] = useState(stage.executeChangeSet);
  const [actionOnReplacement, setActionOnReplacement] = useState(stage.actionOnReplacement);

  const modifyChangeSetName = (value: string) => {
    setChangeSetName(value);
    stageconfig.updateStageField({ changeSetName: value });
  };

  const toggleExecuteChangeSet = (checked: boolean) => {
    setExecuteChangeSet(checked);
    stageconfig.updateStageField({ executeChangeSet: checked });
  };

  const modifyActionOnReplacement = (value: string) => {
    setActionOnReplacement(value);
    stageconfig.updateStageField({ actionOnReplacement: value });
  };

  const actionOnReplacementOptions = [
    { value: 'ask', label: 'ask' },
    { value: 'skip', label: 'skip it' },
    { value: 'execute', label: 'execute it' },
    { value: 'fail', label: 'fail stage' },
  ];

  return (
    <div>
      <hr />
      <h4>ChangeSet Configuration</h4>
      <StageConfigField label="ChangeSet Name" helpkey="someone">
        <TextInput
          className="form-control"
          type="text"
          value={changeSetName}
          onChange={e => modifyChangeSetName(e.target.value)}
        />
      </StageConfigField>
      <StageConfigField label="Execute ChangeSet">
        <CheckboxInput checked={executeChangeSet} onChange={e => toggleExecuteChangeSet(e.target.checked)} />
      </StageConfigField>
      {executeChangeSet && (
        <StageConfigField label="If ChangeSet contains a replacement" help-key="aws.cloudformation.changeSet.options">
          <ReactSelectInput
            clearable={false}
            value={actionOnReplacement}
            options={actionOnReplacementOptions}
            onChange={e => modifyActionOnReplacement(e.target.value)}
          />
        </StageConfigField>
      )}
    </div>
  );
};

export const CLOUD_FORMATION_CHANGE_SET_INFO = 'spinnaker.amazon.cloudformation.changetset.info.component';

module(CLOUD_FORMATION_CHANGE_SET_INFO, []).component(
  'cloudFormationChangeSetInfo',
  react2angular(CloudFormationChangeSetInfo, ['stage', 'stageconfig']),
);
