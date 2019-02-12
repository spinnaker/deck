import * as React from 'react';
import { isFinite } from 'lodash';
import { StageConfigField } from 'core/pipeline/config/stages/common/stageConfigField/StageConfigField';
import { IArtifactEditorProps, IArtifact } from 'core/domain';
import { SpelText } from 'core/widgets/spelText/SpelText';

export const singleFieldArtifactEditor = (
  fieldKey: keyof IArtifact,
  label: string,
  placeholder: string,
  helpTextKey: string,
): React.SFC<IArtifactEditorProps> => {
  const SingleFieldArtifactEditor = (props: IArtifactEditorProps) => {
    const labelColumns = isFinite(props.labelColumns) ? props.labelColumns : 2;
    const fieldColumns = isFinite(props.fieldColumns) ? props.fieldColumns : 8;
    return (
      <StageConfigField
        label={label}
        helpKey={helpTextKey}
        labelColumns={labelColumns}
        fieldColumns={fieldColumns}
        groupClassName={props.groupClassName}
      >
        <SpelText
          placeholder={placeholder}
          value={props.artifact[fieldKey] || ''}
          onChange={(value: string) => {
            const clone = { ...props.artifact };
            clone[fieldKey] = value;
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
