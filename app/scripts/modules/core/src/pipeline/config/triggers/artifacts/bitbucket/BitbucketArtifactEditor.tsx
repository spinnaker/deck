import { cloneDeep } from 'lodash';
import * as React from 'react';

import { IArtifactEditorProps, IArtifactKindConfig } from 'core/domain';
import { StageConfigField } from 'core/pipeline';
import { singleFieldArtifactEditor } from '../singleFieldArtifactEditor';
import { SpelText } from 'core/widgets';

export const BitbucketMatch: IArtifactKindConfig = {
  label: 'Bitbucket',
  type: 'bitbucket/file',
  description: 'A file stored in git, hosted by Bitbucket.',
  key: 'bitbucket',
  isDefault: false,
  isMatch: true,
  editCmp: singleFieldArtifactEditor(
    'name',
    'bitbucket/file',
    'File path',
    'manifests/frontend.yaml',
    'pipeline.config.expectedArtifact.git.name',
  ),
};

export const BitbucketDefault: IArtifactKindConfig = {
  label: 'Bitbucket',
  type: 'bitbucket/file',
  description: 'A file stored in git, hosted by Bitbucket.',
  key: 'default.bitbucket',
  isDefault: true,
  isMatch: false,
  editCmp: (props: IArtifactEditorProps) => {
    const onReferenceChanged = (reference: string) => {
      const pathRegex = new RegExp('/1.0/repositories/[^/]*/[^/]*/raw/[^/]*/(.*)$');
      const results = pathRegex.exec(reference);
      if (results !== null) {
        const clonedArtifact = cloneDeep(props.artifact);
        clonedArtifact.name = decodeURIComponent(results[1]);
        clonedArtifact.reference = reference;
        clonedArtifact.type = 'bitbucket/file';
        props.onChange(clonedArtifact);
      }
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
