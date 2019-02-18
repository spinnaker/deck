import * as React from 'react';
import { cloneDeep, isNil } from 'lodash';

import { IArtifact, IArtifactEditorProps, IArtifactKindConfig } from 'core/domain';
import { StageConfigField } from 'core/pipeline';
import { SpelText } from 'core/widgets';

import { singleFieldArtifactEditor } from '../singleFieldArtifactEditor';

export const setNameAndVersionFromReference = (artifact: IArtifact) => {
  const ref = artifact.reference;
  if (isNil(ref)) {
    return artifact;
  }

  const atIndex: number = ref.indexOf('@');
  const lastColonIndex: number = ref.lastIndexOf(':');

  if (atIndex >= 0) {
    const split = ref.split('@');
    artifact.name = split[0];
    artifact.version = split[1];
  } else if (lastColonIndex > 0) {
    artifact.name = ref.substring(0, lastColonIndex);
    artifact.version = ref.substring(lastColonIndex + 1);
  } else {
    artifact.name = ref;
  }
  return artifact;
};

export const DockerMatch: IArtifactKindConfig = {
  label: 'Docker',
  type: 'docker/image',
  isDefault: false,
  isMatch: true,
  description: 'A Docker image to be deployed.',
  key: 'docker',
  editCmp: singleFieldArtifactEditor(
    'name',
    'docker/image',
    'Docker image',
    'gcr.io/project/image',
    'pipeline.config.expectedArtifact.docker.name',
  ),
};

export const DockerDefault: IArtifactKindConfig = {
  label: 'Docker',
  type: 'docker/image',
  isDefault: true,
  isMatch: false,
  description: 'A Docker image to be deployed.',
  key: 'default.docker',
  editCmp: (props: IArtifactEditorProps) => {
    const onReferenceChanged = (reference: string) => {
      const clonedArtifact = cloneDeep(props.artifact);
      clonedArtifact.reference = reference;
      clonedArtifact.type = 'docker/image';
      props.onChange(setNameAndVersionFromReference(clonedArtifact));
    };

    return (
      <StageConfigField label="Object path" helpKey="pipeline.config.expectedArtifact.defaultDocker.reference">
        <SpelText
          placeholder="gcr.io/project/image@sha256:9efcc2818c9..."
          value={props.artifact.reference}
          onChange={onReferenceChanged}
          pipeline={props.pipeline}
          docLink={true}
        />
      </StageConfigField>
    );
  },
};
