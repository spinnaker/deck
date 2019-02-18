import { cloneDeep } from 'lodash';
import * as React from 'react';

import { IArtifactEditorProps, IArtifactKindConfig } from 'core/domain';
import { StageConfigField } from 'core/pipeline';
import { SpelText } from 'core/widgets';

import { singleFieldArtifactEditor } from '../singleFieldArtifactEditor';

export const GitlabMatch: IArtifactKindConfig = {
  label: 'Gitlab',
  type: 'gitlab/file',
  description: 'A file stored in git, hosted by Gitlab.',
  key: 'gitlab',
  isDefault: false,
  isMatch: true,
  editCmp: singleFieldArtifactEditor(
    'name',
    'gitlab/file',
    'File path',
    'manifests/frontend.yaml',
    'pipeline.config.expectedArtifact.git.name',
  ),
};

export const GitlabDefault: IArtifactKindConfig = {
  label: 'Gitlab',
  type: 'gitlab/file',
  description: 'A file stored in git, hosted by Gitlab.',
  key: 'default.gitlab',
  isDefault: true,
  isMatch: false,
  editCmp: (props: IArtifactEditorProps) => {
    const pathRegex = new RegExp('/api/v4/projects/[^/]*/[^/]*/repository/files/(.*)$');

    const onReferenceChange = (reference: string) => {
      const results = pathRegex.exec(reference);
      if (results !== null) {
        const clonedArtifact = cloneDeep(props.artifact);
        clonedArtifact.name = decodeURIComponent(results[1]);
        clonedArtifact.reference = reference;
        clonedArtifact.type = 'gitlab/file';
        props.onChange(clonedArtifact);
      }
    };

    const onVersionChange = (version: string) => {
      const clonedArtifact = cloneDeep(props.artifact);
      clonedArtifact.version = version;
      clonedArtifact.type = 'gitlab/file';
      props.onChange(clonedArtifact);
    };

    return (
      <>
        <StageConfigField label="Content URL" helpKey="pipeline.config.expectedArtifact.defaultGitlab.reference">
          <SpelText
            placeholder="https://gitlab.com/api/v4/projects/$ORG%2F$REPO/repository/files/path%2Fto%2Ffile.yml/raw"
            value={props.artifact.reference}
            onChange={onReferenceChange}
            pipeline={props.pipeline}
            docLink={false}
          />
        </StageConfigField>
        <StageConfigField label="Commit/Branch" helpKey="pipeline.config.expectedArtifact.defaultGitlab.version">
          <SpelText
            placeholder="master"
            value={props.artifact.version}
            onChange={onVersionChange}
            pipeline={props.pipeline}
            docLink={false}
          />
        </StageConfigField>
      </>
    );
  },
};
