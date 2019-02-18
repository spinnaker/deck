import { cloneDeep, isNil } from 'lodash';
import * as React from 'react';

import { IArtifactEditorProps, IArtifactKindConfig } from 'core/domain';
import { StageConfigField } from 'core/pipeline';
import { SpelText } from 'core/widgets';

import { singleFieldArtifactEditor } from '../singleFieldArtifactEditor';

export const GcsMatch: IArtifactKindConfig = {
  label: 'GCS',
  type: 'gcs/object',
  description: 'A GCS object.',
  key: 'gcs',
  isDefault: false,
  isMatch: true,
  editCmp: singleFieldArtifactEditor(
    'name',
    'gcs/object',
    'Object path',
    'gs://bucket/path/to/file',
    'pipeline.config.expectedArtifact.gcs.name',
  ),
};

export const GcsDefault: IArtifactKindConfig = {
  label: 'GCS',
  type: 'gcs/object',
  description: 'A GCS object.',
  key: 'default.gcs',
  isDefault: true,
  isMatch: false,
  editCmp: (props: IArtifactEditorProps) => {
    const artifact = cloneDeep(props.artifact);
    artifact.type = 'gcs/object';
    props.onChange(artifact);

    const onReferenceChange = (reference: string) => {
      if (isNil(reference)) {
        return;
      }

      const clonedArtifact = cloneDeep(props.artifact);
      clonedArtifact.type = 'gcs/object';

      if (reference.indexOf('#') >= 0) {
        const split = reference.split('#');
        clonedArtifact.name = split[0];
        clonedArtifact.version = split[1];
      } else {
        clonedArtifact.name = reference;
      }
      props.onChange(clonedArtifact);
    };

    return (
      <StageConfigField label="Object path" helpKey="pipeline.config.expectedArtifact.defaultGcs.reference">
        <SpelText
          placeholder="gs://bucket/path/to/file"
          value={props.artifact.reference}
          onChange={onReferenceChange}
          pipeline={props.pipeline}
          docLink={true}
        />
      </StageConfigField>
    );
  },
};
