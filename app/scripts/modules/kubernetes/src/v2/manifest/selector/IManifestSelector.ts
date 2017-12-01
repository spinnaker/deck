import { ILabelSelectors } from './IManifestLabelSelector';

export interface IManifestSelector {
  manifestName: string,
  location: string,
  account: string,
  kinds: string[],
  labelSelectors: ILabelSelectors,
}
