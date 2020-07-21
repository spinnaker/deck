import React from 'react';
import { FormikStageConfig, IStageConfigProps } from '@spinnaker/core';
import { TagImageForm } from './TagImageForm';

export function TagImageConfig({ application, pipeline, stage, updateStage }: IStageConfigProps) {
  return (
    <FormikStageConfig
      application={application}
      onChange={updateStage}
      pipeline={pipeline}
      stage={stage}
      render={props => <TagImageForm {...props} />}
    />
  );
}
