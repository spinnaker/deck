import React from 'react';

import { FormikFormField, IFormikStageConfigInjectedProps, IFormInputProps, ReactSelectInput } from '@spinnaker/core';

import { retrieveHealthCheck } from './HealthCheckStrategy';
import { HealthCheckList } from './health.constants';

export function BlueGreenDeploymentForm(props: IFormikStageConfigInjectedProps) {
  const { values } = props.formik;

  return (
    <div>
      <FormikFormField
        label="Health Check Type"
        name="healthCheckType"
        input={(inputProps: IFormInputProps) => (
          <ReactSelectInput {...inputProps} clearable={false} options={HealthCheckList} />
        )}
      />
      {values.healthCheckType ? retrieveHealthCheck(values.healthCheckType, props) : null}
    </div>
  );
}
