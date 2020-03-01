import { ISpotServerGroup } from 'spot/src/domain';

export interface ISpotCluster {
  name: string;
  serverGroups: ISpotServerGroup[];
}
