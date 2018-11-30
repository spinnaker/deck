import { IPipeline, IStage, IValidatorConfig, ICustomValidator } from '@spinnaker/core';
import { IManifestSelector, SelectorMode } from 'kubernetes/v2/manifest/selector/IManifestSelector';

export const trafficValidators = (stageName: string): IValidatorConfig[] => {
  const required = (field: string) => `<strong>${field}</strong> is a required field for ${stageName} stages.`;

  return [
    { type: 'requiredField', fieldName: 'location', fieldLabel: 'Namespace' },
    { type: 'requiredField', fieldName: 'account', fieldLabel: 'Account' },
    {
      type: 'custom',
      validate: (_pipeline: IPipeline, stage: IManifestSelector & IStage) => {
        const [kind] = (stage.manifestName || '').split(' ');
        return !kind && !stage.kind ? required('Kind') : null;
      },
    } as ICustomValidator,
    {
      type: 'custom',
      validate: (_pipeline: IPipeline, stage: IManifestSelector & IStage) => {
        if (stage.mode === SelectorMode.Dynamic) {
          if (!stage.cluster) {
            return required('Cluster');
          }
          if (!stage.criteria) {
            return required('Target');
          }
        } else if (stage.mode === SelectorMode.Static) {
          const [, name] = (stage.manifestName || '').split(' ');
          if (!name) {
            return required('Name');
          }
        }
        return null;
      },
    } as ICustomValidator,
  ];
};
