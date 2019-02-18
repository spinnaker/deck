import { cloneDeep } from 'lodash';
import * as React from 'react';

import { IArtifactEditorProps, IArtifactKindConfig } from 'core/domain';
import { StageConfigField } from 'core/pipeline';
import { SpelText } from 'core/widgets';

import { singleFieldArtifactEditor } from '../singleFieldArtifactEditor';

export const GithubMatch: IArtifactKindConfig = {
  label: 'GitHub',
  description: 'A file stored in git, hosted by GitHub.',
  key: 'github',
  type: 'github/file',
  isDefault: false,
  isMatch: true,
  editCmp: singleFieldArtifactEditor(
    'name',
    'github/file',
    'File path',
    'manifests/frontend.yaml',
    'pipeline.config.expectedArtifact.git.name',
  ),
};

export const GithubDefault: IArtifactKindConfig = {
  label: 'GitHub',
  type: 'github/file',
  description: 'A file stored in git, hosted by GitHub.',
  key: 'default.github',
  isDefault: true,
  isMatch: false,
  editCmp: (props: IArtifactEditorProps) => {
    // const artifact = cloneDeep(props.artifact);
    // artifact.type = 'github/file';
    // props.onChange(artifact);

    const pathRegex = new RegExp('/repos/[^/]*/[^/]*/contents/(.*)$');

    const onReferenceChange = (reference: string) => {
      const results = pathRegex.exec(reference);
      if (results !== null) {
        const clonedArtifact = cloneDeep(props.artifact);
        clonedArtifact.name = results[1];
        clonedArtifact.reference = reference;
        clonedArtifact.type = 'github/file';
        props.onChange(clonedArtifact);
      }
    };

    const onVersionChange = (version: string) => {
      const clonedArtifact = cloneDeep(props.artifact);
      clonedArtifact.version = version;
      clonedArtifact.type = 'github/file';
      props.onChange(clonedArtifact);
    };

    return (
      <>
        <StageConfigField label="Content URL" helpKey="pipeline.config.expectedArtifact.defaultGithub.reference">
          <SpelText
            placeholder="https://api.github.com/repos/$ORG/$REPO/contents/$FILEPATH"
            value={props.artifact.reference}
            onChange={onReferenceChange}
            pipeline={props.pipeline}
            docLink={false}
          />
        </StageConfigField>
        <StageConfigField label="Commit/Branch" helpKey="pipeline.config.expectedArtifact.defaultGithub.version">
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
