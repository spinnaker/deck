import { cloneDeep } from 'lodash';
import * as React from 'react';

import { ArtifactTypePatterns } from 'core/artifact';
import { IArtifactEditorProps, IArtifactKindConfig } from 'core/domain';
import { StageConfigField } from 'core/pipeline';
import { SpelText } from 'core/widgets';

import { singleFieldArtifactEditor } from '../singleFieldArtifactEditor';
import { ArtifactEditor } from '../ArtifactEditor';

const TYPE = 'bitbucket/file';

export const BitbucketMatch: IArtifactKindConfig = {
  label: 'Bitbucket',
  typePattern: ArtifactTypePatterns.BITBUCKET_FILE,
  type: TYPE,
  description: 'A file stored in git, hosted by Bitbucket.',
  key: 'bitbucket',
  isDefault: false,
  isMatch: true,
  editCmp: singleFieldArtifactEditor(
    'name',
    TYPE,
    'File path',
    'manifests/frontend.yaml',
    'pipeline.config.expectedArtifact.git.name',
  ),
};

export const BitbucketDefault: IArtifactKindConfig = {
  label: 'Bitbucket',
  typePattern: ArtifactTypePatterns.BITBUCKET_FILE,
  type: TYPE,
  description: 'A file stored in git, hosted by Bitbucket.',
  key: 'default.bitbucket',
  isDefault: true,
  isMatch: false,
  editCmp: class extends ArtifactEditor {
    constructor(props: IArtifactEditorProps) {
      super(props, TYPE);
    }

    private onReferenceChanged = (reference: string) => {
      const pathRegex = new RegExp('.*/rest/api/1.0/[^/]*/[^/]*/repos/[^/]*/raw/(.*)$');
      const results = pathRegex.exec(reference);
      const clonedArtifact = cloneDeep(this.props.artifact);
      clonedArtifact.reference = reference;
      if (results !== null) {
        clonedArtifact.name = results[1];
      } else {
        clonedArtifact.name = reference;
      }
      this.props.onChange(clonedArtifact);
    };

    public render() {
      return (
        <StageConfigField label="Object path" helpKey="pipeline.config.expectedArtifact.defaultDocker.reference">
          <SpelText
            placeholder="https://api.bitbucket.com/rest/api/1.0/$PROJECTS/$PROJECTKEY/repos/$REPONAME/raw/$FILEPATH"
            value={this.props.artifact.reference}
            onChange={this.onReferenceChanged}
            pipeline={this.props.pipeline}
            docLink={true}
          />
        </StageConfigField>
      );
    }
  },
};
