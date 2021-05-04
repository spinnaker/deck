import React from 'react';

import { IFormikStageConfigInjectedProps } from '@spinnaker/core';

import { retrieveComponent } from './RenderStrategy';

export function DeploymentStrategyForm(props: IFormikStageConfigInjectedProps) {
  const { values } = props.formik;

  return (
    <div className="form-horizontal">
      {values.deploymentStrategy ? retrieveComponent(values.deploymentStrategy, props) : null}
    </div>
  );
}
