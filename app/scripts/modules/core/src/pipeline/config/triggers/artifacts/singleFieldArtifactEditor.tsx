import * as React from 'react';
import { cloneDeep } from 'lodash';
import { StageConfigField } from 'core/pipeline/config/stages/common';
import { IArtifactEditorProps, IArtifact } from 'core/domain';
import { SpelText } from 'core/widgets';

export const singleFieldArtifactEditor = (
  fieldKey: keyof IArtifact,
  type: string,
  label: string,
  placeholder: string,
  helpTextKey: string,
): React.SFC<IArtifactEditorProps> => {
  const SingleFieldArtifactEditor = (props: IArtifactEditorProps) => {
    return (
      <StageConfigField label={label} helpKey={helpTextKey}>
        <SpelText
          placeholder={placeholder}
          value={props.artifact[fieldKey] || ''}
          onChange={(value: string) => {
            const clone = cloneDeep(props.artifact);
            clone[fieldKey] = value;
            clone.type = type;
            props.onChange(clone);
          }}
          pipeline={props.pipeline}
          docLink={true}
        />
      </StageConfigField>
    );
  };
  return SingleFieldArtifactEditor;
};
