import React from 'react';

import { SETTINGS } from 'core/config';
import { IPipeline } from 'core/domain';
import { ReactSelectInput } from 'core/presentation';

import { StageConfigField } from '../common';
import { IFormikStageConfigInjectedProps } from '../FormikStageConfig';
import { BakeKustomizeConfigForm } from './kustomize/BakeKustomizeConfigForm';
import { BakeHelmConfigForm } from './helm/BakeHelmConfigForm';
import { ManifestRenderers, HELM_RENDERERS } from './ManifestRenderers';

interface IBakeManifestStageFormProps {
  updatePipeline: (pipeline: IPipeline) => void;
}

export function BakeManifestStageForm({
  application,
  formik,
  pipeline,
  updatePipeline,
}: IBakeManifestStageFormProps & IFormikStageConfigInjectedProps) {
  const stage = formik.values;

  const templateRenderers = React.useMemo(() => {
    const renderers = [...HELM_RENDERERS];
    if (SETTINGS.feature.kustomizeEnabled) {
      renderers.push(ManifestRenderers.KUSTOMIZE);
    }
    return renderers;
  }, []);

  return (
    <div className="form-horizontal clearfix">
      <div className="container-fluid form-horizontal">
        <h4>Template Renderer</h4>
        <StageConfigField
          fieldColumns={3}
          label={'Render Engine'}
          helpKey={'pipeline.config.bake.manifest.templateRenderer'}
        >
          <ReactSelectInput
            clearable={false}
            onChange={(o: React.ChangeEvent<HTMLSelectElement>) => {
              formik.setFieldValue('templateRenderer', o.target.value);
            }}
            value={stage.templateRenderer}
            stringOptions={templateRenderers}
          />
        </StageConfigField>
        {stage.templateRenderer === ManifestRenderers.KUSTOMIZE && (
          <BakeKustomizeConfigForm
            pipeline={pipeline}
            application={application}
            formik={formik}
            updatePipeline={updatePipeline}
          />
        )}
        {HELM_RENDERERS.includes(stage.templateRenderer) && (
          <BakeHelmConfigForm
            pipeline={pipeline}
            application={application}
            formik={formik}
            updatePipeline={updatePipeline}
          />
        )}
      </div>
    </div>
  );
}
