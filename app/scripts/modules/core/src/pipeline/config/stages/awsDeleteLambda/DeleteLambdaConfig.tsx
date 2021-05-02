import { FormikStageConfig, IFormikStageConfigInjectedProps, IStageConfigProps } from 'core';
import React from 'react';

import { DeleteLambdaFunctionStageForm } from './DeleteLambdaFunctionStageForm';
import { validate } from './DeleteLambdaValidator';

export function DeleteLambdaConfig(props: IStageConfigProps) {
  return (
    <div className="DeleteLambdaStageConfig">
      <FormikStageConfig
        {...props}
        validate={validate}
        onChange={props.updateStage}
        render={(props: IFormikStageConfigInjectedProps) => <DeleteLambdaFunctionStageForm {...props} />}
      />
    </div>
  );
}
