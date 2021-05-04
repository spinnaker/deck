import React from 'react';

import { IFormikStageConfigInjectedProps } from '@spinnaker/core';

import { InvokeLambdaHealthCheck } from './InvocationHealthCheck';

export function retrieveHealthCheck(value: string, props: IFormikStageConfigInjectedProps) {
  switch (value) {
    case '$LAMBDA':
      return <InvokeLambdaHealthCheck {...props} />;
    case '$WEIGHTED':
      return null;
    case '$BLUEGREEN':
      return null;
    default:
      return null;
  }
}
