import { IHealth } from './IHealth';

export interface IInstance {
  account?: string;
  availabilityZone?: string;
  cloudProvider?: string;
  hasHealthStatus?: boolean;
  health: IHealth[];
  healthState?: string;
  id: string; // this is the instance's name; not necessarily unique
  launchTime: number;
  loadBalancers?: string[];
  provider?: string;
  region?: string;
  serverGroup?: string;
  uid: string;
  vpcId?: string;
  zone: string;
}
