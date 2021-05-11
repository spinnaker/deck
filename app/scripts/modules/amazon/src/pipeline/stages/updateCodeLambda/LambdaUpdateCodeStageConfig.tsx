import React from 'react';

import { FormikStageConfig, IFormikStageConfigInjectedProps, IStageConfigProps } from '@spinnaker/core';

import { validate } from './LambdaUpdateCodeValidator';
import { UpdateCodeLambdaFunctionStageForm } from './components/UpdateCodeStageForm';

export function LambdaUpdateCodeConfig(props: IStageConfigProps) {
  return (
    <div className="LambdaUpdateCodeConfig">
      <FormikStageConfig
        {...props}
        validate={validate}
        onChange={props.updateStage}
        render={(props: IFormikStageConfigInjectedProps) => <UpdateCodeLambdaFunctionStageForm {...props} />}
      />
    </div>
  );
}
