import * as React from 'react';
import { cloneDeep, extend } from 'lodash';

import { ArtifactTypePatterns } from 'core/artifact';
import { IArtifactEditorProps, IArtifactKindConfig } from 'core/domain';
import { StageConfigField } from 'core/pipeline';
import { SpelText } from 'core/widgets';

import { ArtifactEditor } from '../ArtifactEditor';

export const TYPE = 'custom/object';
export const CUSTOM_ARTIFACT_ACCOUNT = 'custom-artifact';

export class CustomArtifactEditor extends ArtifactEditor {
  constructor(props: IArtifactEditorProps) {
    super(props, TYPE);
  }

  private onTypeChanged = (type: string) => {
    this.updateArtifact({ type });
  };

  private onNameChanged = (name: string) => {
    this.updateArtifact({ name });
  };

  private onVersionChanged = (version: string) => {
    this.updateArtifact({ version });
  };

  private onLocationChanged = (location: string) => {
    this.updateArtifact({ location });
  };

  private onReferenceChanged = (reference: string) => {
    this.updateArtifact({ reference });
  };

  private updateArtifact = (changes: any) => {
    const clonedArtifact = cloneDeep(this.props.artifact);
    extend(clonedArtifact, changes);
    this.props.onChange(clonedArtifact);
  };

  public render() {
    return (
      <>
        <StageConfigField label="Type">
          <SpelText
            placeholder=""
            value={this.props.artifact.type}
            onChange={this.onTypeChanged}
            pipeline={this.props.pipeline}
            docLink={true}
          />
        </StageConfigField>
        <StageConfigField label="Name">
          <SpelText
            placeholder=""
            value={this.props.artifact.name}
            onChange={this.onNameChanged}
            pipeline={this.props.pipeline}
            docLink={true}
          />
        </StageConfigField>
        <StageConfigField label="Version">
          <SpelText
            placeholder=""
            value={this.props.artifact.version}
            onChange={this.onVersionChanged}
            pipeline={this.props.pipeline}
            docLink={true}
          />
        </StageConfigField>
        <StageConfigField label="Location">
          <SpelText
            placeholder=""
            value={this.props.artifact.location}
            onChange={this.onLocationChanged}
            pipeline={this.props.pipeline}
            docLink={true}
          />
        </StageConfigField>
        <StageConfigField label="Reference">
          <SpelText
            placeholder=""
            value={this.props.artifact.reference}
            onChange={this.onReferenceChanged}
            pipeline={this.props.pipeline}
            docLink={true}
          />
        </StageConfigField>
      </>
    );
  }
}

export const CustomMatch: IArtifactKindConfig = {
  label: 'Custom',
  typePattern: ArtifactTypePatterns.CUSTOM_OBJECT,
  type: TYPE,
  description: 'A custom-defined artifact.',
  key: 'custom',
  isDefault: false,
  isMatch: true,
  editCmp: CustomArtifactEditor,
};

export const CustomDefault: IArtifactKindConfig = {
  label: 'Custom',
  typePattern: ArtifactTypePatterns.CUSTOM_OBJECT,
  type: TYPE,
  description: 'A custom-defined artifact.',
  key: 'default.custom',
  isDefault: true,
  isMatch: false,
  editCmp: CustomArtifactEditor,
};
