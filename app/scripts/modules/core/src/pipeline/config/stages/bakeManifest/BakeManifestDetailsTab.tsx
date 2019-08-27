import * as React from 'react';

import {
  decodeUnicodeBase64,
  ExecutionDetailsSection,
  IArtifact,
  IExecutionDetailsSectionProps,
  ManifestYaml,
  StageFailureMessage,
} from '@spinnaker/core';

export class BakeManifestDetailsTab extends React.Component<IExecutionDetailsSectionProps> {
  public static title = 'bakedManifest';

  public render() {
    const { current, name, stage } = this.props;
    const bakedArtifacts: IArtifact[] = (stage.context.artifacts || []).filter(
      (a: IArtifact) => a.type === 'embedded/base64',
    );
    return (
      <ExecutionDetailsSection name={name} current={current}>
        <StageFailureMessage stage={stage} message={stage.failureMessage} />
        {bakedArtifacts.map((artifact, i) => (
          <ManifestYaml
            key={i}
            linkName={bakedArtifacts.length > 1 ? `Baked Manifest ${i} YAML` : 'Baked Manifest YAML'}
            manifestText={decodeUnicodeBase64(artifact.reference)}
            modalTitle="Baked Manifest"
          />
        ))}
      </ExecutionDetailsSection>
    );
  }
}
