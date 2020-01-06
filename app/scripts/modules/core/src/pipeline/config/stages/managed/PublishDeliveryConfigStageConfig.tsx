import React from 'react';

import { SETTINGS } from 'core/config/settings';
import { IStageConfigProps, FormikStageConfig } from 'core/pipeline';
import { FormikFormField, TextInput } from 'core/presentation';
import { HelpField } from 'core/help';

export const PublishDeliveryConfigStageConfig: React.SFC<IStageConfigProps> = stageConfigProps => (
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
