import React from 'react';
import { cloneDeep } from 'lodash';

import { FormikStageConfig, IStageConfigProps } from '@spinnaker/core';
import { EnableSGStageForm } from './enableSGStageForm';

export function EnableSGConfig({ application, pipeline, stage, updateStage }: IStageConfigProps) {
  const stageWithDefaults = React.useMemo(() => {
    return {
      cloudProvider: 'tencentcloud',
      regions: stage.regions || [],
      ...cloneDeep(stage),
    };
  }, []);

  return (
    <FormikStageConfig
      application={application}
      onChange={updateStage}
      pipeline={pipeline}
      stage={stageWithDefaults}
      render={props => <EnableSGStageForm {...props} />}
    />
  );
}
