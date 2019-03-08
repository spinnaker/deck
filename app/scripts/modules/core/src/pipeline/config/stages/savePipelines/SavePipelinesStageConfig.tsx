import * as React from 'react';

import { IStageConfigProps, StageConfigField } from 'core/pipeline';
import { IArtifact, IExpectedArtifact, StageArtifactSelector } from '@spinnaker/core';

export class SavePipelinesStageConfig extends React.Component<IStageConfigProps> {
  public render() {
    const { stage, pipeline } = this.props;
    return (
      <div className="container-fluid form-horizontal">
        <StageConfigField label="Expected Artifact" fieldColumns={8}>
          <StageArtifactSelector
            pipeline={pipeline}
            stage={stage}
            expectedArtifactId={this.props.stage.pipelinesArtifactId}
            artifact={this.props.stage.pipelinesArtifact}
            onArtifactEdited={(artifact: IArtifact) => {
              this.props.updateStageField({ pipelinesArtifact: artifact });
              this.props.updateStageField({ pipelinesArtifactId: null });
            }}
            onExpectedArtifactSelected={(expectedArtifact: IExpectedArtifact) => {
              this.props.updateStageField({ pipelinesArtifactId: expectedArtifact.id });
              this.props.updateStageField({ pipelinesArtifact: null });
            }}
          />
        </StageConfigField>
      </div>
    );
  }
}
