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
      // TODO: make this text look pretty. Also I'm not sure the config section is the right place for it...
      <div className="form-horizontal">
        <div>
          This stage will retrieve a Delivery Config manifest from the source control repository associated with your
          pipeline's trigger, then save (or update) it in Spinnaker so it will automatically monitor and manage your
          application's infrastructure resources within logical environments, as well as the deployment of artifacts
          into those environments.
          <p />
          Both fields below are optional, and for most users should be left blank to use defaults for the location and
          name of the manifest file.
          <p />
          Click <a href={'todo'}>here</a> to learn more about Managed Delivery in Spinnaker.
        </div>
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
          input={props => <TextInput {...props} placeholder={SETTINGS.managedDelivery.defaultManifest} />}
        />
      </div>
    )}
  />
);
