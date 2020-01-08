import React from 'react';

import { SETTINGS } from 'core/config/settings';
import { IStageConfigProps, FormikStageConfig, IContextualValidator } from 'core/pipeline';
import { FormikFormField, FormValidator, TextInput } from 'core/presentation';
import { HelpField } from 'core/help';
import { IStage } from 'core/domain';

export const ImportDeliveryConfigStageConfig: React.ComponentType<IStageConfigProps> = stageConfigProps => (
  <FormikStageConfig
    {...stageConfigProps}
    onChange={stageConfigProps.updateStage}
    render={() => (
      <div className="form-horizontal">
        <FormikFormField
          name="directory"
          label="Directory"
          help={<HelpField id="pipeline.config.deliveryConfig.directory" />}
          input={props => <TextInput {...props} placeholder={'/'} />}
        />
        <FormikFormField
          name="manifest"
          label="File name"
          help={<HelpField id="pipeline.config.deliveryConfig.manifest" />}
          input={props => <TextInput {...props} placeholder={SETTINGS.managedDelivery?.defaultManifest} />}
        />
      </div>
    )}
  />
);

export const validate: IContextualValidator = (_stage: IStage, context: any) => {
  if (context.pipeline.triggers.length != 1) {
    return {
      error:
        'This stage requires a trigger that provides information about your source control repo (such ' +
        'as a Git Trigger), to locate your Delivery Config manifest.',
    };
  }
  const formValidator = new FormValidator(context.pipeline.triggers[0]);
  formValidator.field('source', 'Repo Type').required();
  formValidator.field('project', 'Project').required();
  formValidator.field('slug', 'Repo Name').required();
  formValidator.field('branch', 'Branch').required();
  return formValidator.validateForm();
};
