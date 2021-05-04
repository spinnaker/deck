import React from 'react';

import { FormikStageConfig, IFormikStageConfigInjectedProps, IStageConfigProps } from '@spinnaker/core';

import { InvokeLambdaFunctionStageForm } from './InvokeLambdaFunctionStageForm';
import { validate } from './InvokeLambdaValidator';

export function InvokeLambdaConfig(props: IStageConfigProps) {
  return (
    <div className="InvokeLambdaStageConfig">
      <FormikStageConfig
        {...props}
        validate={validate}
        onChange={props.updateStage}
        render={(props: IFormikStageConfigInjectedProps) => <InvokeLambdaFunctionStageForm {...props} />}
      />
    </div>
  );
}
