import { IMoniker } from 'core/naming';

import { IInstanceCounts } from './IInstanceCounts';
import { IManagedResource } from './IManagedEntity';
import { IServerGroup } from './IServerGroup';
import { ITaggedEntity } from './ITaggedEntity';

export interface IAutoscalerSourceData {
  cloudProvider: string;
  name: string;
  provider?: string;
  type: string;
}

export interface IAutoscaler extends ITaggedEntity, IManagedResource {
  account: string;
  cloudProvider: string;
  instanceCounts?: IInstanceCounts;
  moniker?: IMoniker;
  name: string;
  provider?: string;
  region: string;
  serverGroups?: IServerGroup[];
  stack?: string;
  type: string;
}
