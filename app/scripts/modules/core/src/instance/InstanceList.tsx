export interface IInstanceListProps {
  hasDiscovery: boolean;
  hasLoadBalancers: boolean;
  instances: any[];
  sortFilter: any;
  serverGroup: any;
}

export const instanceListBindings: Record<keyof IInstanceListProps, string> = {
  hasDiscovery: '=',
  hasLoadBalancers: '=',
  instances: '=',
  sortFilter: '=',
  serverGroup: '=',
};
