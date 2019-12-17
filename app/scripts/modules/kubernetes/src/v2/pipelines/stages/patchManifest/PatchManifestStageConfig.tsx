import React from 'react';
import { defaults } from 'lodash';

import { FormikStageConfig, IStage, IStageConfigProps } from '@spinnaker/core';
import { PatchManifestStageForm } from './PatchManifestStageForm';

export class PatchManifestStageConfig extends React.Component<IStageConfigProps> {
  private readonly stage: IStage;

  public constructor(props: IStageConfigProps) {
    super(props);
    defaults(props.stage, {
      app: props.application.name,
      source: 'text',
      options: {
        record: true,
        mergeStrategy: 'strategic',
      },
      cloudProvider: 'kubernetes',
    });

    // There was a bug introduced in Spinnaker 1.15 where we were incorrectly
    // storing the merge strategy on a field called 'strategy' instead of on
    // 'mergeStrategy'.  In order to auto-fix pipelines affected by that bug,
    // delete any value in 'strategy'. If 'mergeStrategy' is empty, set it to
    // the value we deleted from 'strategy'.
    defaults(props.stage.options, {
      mergeStrategy: props.stage.options.strategy,
    });
    delete props.stage.options.strategy;

    // There was a bug introduced in Spinnaker 1.15 where we were incorrectly
    // always storing the patchBody as an object. In order to auto-fix pipelines
    // affected by that bug, massage any configured patchBody value into a list.
    if (props.stage.patchBody && !Array.isArray(props.stage.patchBody)) {
      props.stage.patchBody = [props.stage.patchBody];
    }

    // Intentionally initializing the stage config only once in the constructor
    // The stage config is then completely owned within FormikStageConfig's Formik state
    this.stage = props.stage;
  }

  public render() {
    return (
      <FormikStageConfig
        {...this.props}
        stage={this.stage}
        onChange={this.props.updateStage}
        render={props => (
          <PatchManifestStageForm
            {...props}
            stageFieldUpdated={this.props.stageFieldUpdated}
            updatePipeline={this.props.updatePipeline}
          />
        )}
      />
    );
  }
}
