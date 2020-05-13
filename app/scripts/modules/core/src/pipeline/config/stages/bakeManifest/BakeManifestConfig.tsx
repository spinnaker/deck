import React from 'react';
import { cloneDeep } from 'lodash';
import { FormikErrors } from 'formik';

import { IExpectedArtifact, IStage } from 'core/domain';
import { FormValidator } from 'core/presentation';

import { FormikStageConfig } from '../FormikStageConfig';
import { IStageConfigProps } from '../common';
import { BakeManifestStageForm, validateProducedArtifacts } from './BakeManifestStageForm';
import { HELM_RENDERERS } from './ManifestRenderers';

export function BakeManifestConfig({ application, pipeline, stage, updateStage }: IStageConfigProps) {
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
      render={props => <BakeManifestStageForm {...props} />}
    />
  );
}

export function validateBakeManifestStage(stage: IStage): FormikErrors<IStage> {
  const formValidator = new FormValidator(stage);

  formValidator
    .field('expectedArtifacts', 'Produced artifacts')
    .required()
    .withValidators((artifacts: IExpectedArtifact[]) => {
      if (validateProducedArtifacts(artifacts)) {
        return undefined;
      }
      return 'Exactly one expected artifact of type embedded/base64 must be configured in the Produces Artifacts section';
    });

  if (HELM_RENDERERS.includes(stage.templateRenderer)) {
    formValidator.field('outputName', 'Name').required();
  }

  return formValidator.validateForm();
}
