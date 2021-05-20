import React from 'react';

import { StageConfigField } from 'core/pipeline';

import { IStageArtifactSelectorProps, StageArtifactSelector } from './StageArtifactSelector';

interface IStageArtifactSelectorDelegateProps {
  helpKey?: string;
  label: string;
  fieldColumns?: number;
}

/** @deprecated use StageArtifactSelector instead */
export const StageArtifactSelectorDelegate = (
  props: IStageArtifactSelectorProps & IStageArtifactSelectorDelegateProps,
) => {
  return (
    <StageConfigField label={props.label} helpKey={props.helpKey} fieldColumns={props.fieldColumns}>
      <StageArtifactSelector {...props} />
    </StageConfigField>
  );
};
