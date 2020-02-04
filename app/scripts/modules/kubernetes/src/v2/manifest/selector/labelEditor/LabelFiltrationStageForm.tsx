import * as React from 'react';

import { CheckboxInput, StageConfigField } from '@spinnaker/core';

import LabelEditor from '../../selector/labelEditor/LabelEditor';
import { IManifestLabelSelector, IManifestLabelSelectors, SelectorKind } from '../IManifestLabelSelector';

export interface ILabelFiltrationStageConfig extends IManifestLabelSelectors {
  enabled: boolean;
}

interface ILabelFiltrationStageFormProps {
  config: ILabelFiltrationStageConfig;
  setConfig: (config: ILabelFiltrationStageConfig) => void;
}

const permittedSelectorKinds = [
  SelectorKind.EQUALS,
  SelectorKind.NOT_EQUALS,
  SelectorKind.CONTAINS,
  SelectorKind.NOT_CONTAINS,
  SelectorKind.EXISTS,
  SelectorKind.NOT_EXISTS,
];

// todo(mneterval): replace StageConfigFields with FormikFormFields when we refactor consuming stages
// to manage form state with FormikStageConfig
export function LabelFiltrationStageForm({ config, setConfig }: ILabelFiltrationStageFormProps) {
  return (
    <>
      <StageConfigField helpKey="kubernetes.manifest.labelSelectors" label="Filter by label">
        <CheckboxInput
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setConfig({
              ...config,
              enabled: e.target.checked,
            });
          }}
          text="Only apply a subset of manifests based on label"
          value={config?.enabled ?? false}
        />
      </StageConfigField>
      {config?.enabled && (
        <StageConfigField label="Labels">
          <LabelEditor
            labelSelectors={config?.selectors ?? []}
            onLabelSelectorsChange={(selectors: IManifestLabelSelector[]) => {
              setConfig({
                ...config,
                selectors,
              });
            }}
            selectorKinds={permittedSelectorKinds}
          />
        </StageConfigField>
      )}
    </>
  );
}
