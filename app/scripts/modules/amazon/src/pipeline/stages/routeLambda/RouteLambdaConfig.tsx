import React from 'react';

import { FormikStageConfig, IFormikStageConfigInjectedProps, IStageConfigProps } from '@spinnaker/core';

import { RouteLambdaFunctionStageForm } from './RouteLambdaFunctionStageForm';
import { validate } from './RouteLambdaValidator';

export function RouteLambdaConfig(props: IStageConfigProps) {
  return (
    <div className="RouteLambdaStageConfig">
      <FormikStageConfig
        {...props}
        validate={validate}
        onChange={props.updateStage}
        render={(props: IFormikStageConfigInjectedProps) => <RouteLambdaFunctionStageForm {...props} />}
      />
    </div>
  );
}
