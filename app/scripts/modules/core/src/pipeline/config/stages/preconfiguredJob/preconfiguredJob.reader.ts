
import { API } from 'core/api';

export interface IPreconfiguredJobParameter {
  name: string;
  label: string;
  type: string;
  description?: string;
  defaultValue?: string;
  order?: number;
}

export interface IPreconfiguredJob {
  type: string;
  uiType: 'CUSTOM' | 'BASIC';
  label: string;
  description?: string;
  waitForCompletion?: boolean;
  parameters?: IPreconfiguredJobParameter[];
  producesArtifacts: boolean;
}

export const PreconfiguredJobReader = {
  list(): PromiseLike<IPreconfiguredJob[]> {
    return API.one('jobs').all('preconfigured').useCache().getList();
  },
};
