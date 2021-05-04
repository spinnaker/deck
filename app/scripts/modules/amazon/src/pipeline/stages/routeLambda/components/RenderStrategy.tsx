import React from 'react';

import { IFormikStageConfigInjectedProps } from '@spinnaker/core';

import { BlueGreenDeploymentForm } from './BlueGreenDeployment';
import { SimpleDeploymentForm } from './SimpleDeploymentForm';
import { WeightedDeploymentForm } from './WeightedDeploymentForm';

export function retrieveComponent(value: string, props: IFormikStageConfigInjectedProps) {
  switch (value) {
    case '$SIMPLE':
      return <SimpleDeploymentForm {...props} />;
    case '$WEIGHTED':
      return <WeightedDeploymentForm {...props} />;
    case '$BLUEGREEN':
      return <BlueGreenDeploymentForm {...props} />;
    default:
      return null;
  }
}
