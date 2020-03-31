import React from 'react';
import { cloneDeep } from 'lodash';
import { FormikErrors } from 'formik';

import { IStage } from 'core/domain';
import { FormValidator } from 'core/presentation';

import { FormikStageConfig } from '../FormikStageConfig';
import { IStageConfigProps } from '../common';
import { BakeManifestStageForm } from './BakeManifestStageForm';
import { HELM_RENDERERS } from './ManifestRenderers';

export function BakeManifestConfig({ application, pipeline, stage, updatePipeline, updateStage }: IStageConfigProps) {
  const stageWithDefaults = React.useMemo(() => {
    return {
      inputArtifacts: [],
      overrides: {},
      ...cloneDeep(stage),
    };
  }, []);

  return (
    <FormikStageConfig
      application={application}
      onChange={updateStage}
      pipeline={pipeline}
      stage={stageWithDefaults}
      validate={validateBakeManifestStage}
      render={props => <BakeManifestStageForm {...props} updatePipeline={updatePipeline} />}
    />
  );
}

export function validateBakeManifestStage(stage: IStage): FormikErrors<IStage> {
  const formValidator = new FormValidator(stage);

  if (HELM_RENDERERS.includes(stage.templateRenderer)) {
    formValidator.field('outputName', 'Name').required();
  }

  return formValidator.validateForm();
}
