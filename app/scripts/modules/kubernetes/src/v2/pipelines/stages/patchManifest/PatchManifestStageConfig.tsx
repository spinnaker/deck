import * as React from 'react';
import { defaults } from 'lodash';

import { FormikStageConfig, IStage, IStageConfigProps } from '@spinnaker/core';
import { PatchManifestStageForm } from './PatchManifestStageForm';

export class PatchManifestStageConfig extends React.Component<IStageConfigProps> {
  private readonly stage: IStage;

  public constructor(props: IStageConfigProps) {
    super(props);
    defaults(props.stage, {
      source: 'text',
      options: {
        record: true,
        strategy: 'strategic',
      },
      cloudProvider: 'kubernetes',
    });

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
