import { cloneDeep } from 'lodash';
import React from 'react';

import { IArtifact, IArtifactEditorProps } from 'core/domain';
import { SpelText } from 'core/widgets';

import { ArtifactEditor } from './ArtifactEditor';
import { StageConfigField } from '../../stages/common';

export const singleFieldArtifactEditor = (
  fieldKey: keyof IArtifact,
  type: string,
  label: string,
  placeholder: string,
  helpTextKey: string,
) => {
  return class extends ArtifactEditor {
    constructor(props: IArtifactEditorProps) {
      super(props, type);
    }

    public render() {
      return (
        <StageConfigField label={label} helpKey={helpTextKey}>
          <SpelText
            placeholder={placeholder}
            value={this.props.artifact[fieldKey] || ''}
            onChange={(value: string) => {
              const clone = cloneDeep(this.props.artifact);
              (clone[fieldKey] as any) = value;
              clone.type = type;
              this.props.onChange(clone);
            }}
            pipeline={this.props.pipeline}
            docLink={true}
          />
        </StageConfigField>
      );
    }
  };
};
