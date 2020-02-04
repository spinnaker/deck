import { flatten, keyBy } from 'lodash';
import { IAmazonApplicationLoadBalancer, IAmazonNetworkLoadBalancer, ITargetGroup, IAmazonHealth } from 'amazon/domain';

export const getAllTargetGroups = (
  loadBalancers: IAmazonApplicationLoadBalancer[] | IAmazonNetworkLoadBalancer[],
): { [name: string]: ITargetGroup } => {
  const allTargetGroups = loadBalancers.map(d => d.targetGroups);
  const targetGroups = keyBy(flatten(allTargetGroups), 'name');
  return targetGroups;
};

export const applyHealthCheckInfoToTargetGroups = (
  healthMetrics: IAmazonHealth[],
  targetGroups: { [name: string]: ITargetGroup },
) => {
  healthMetrics.forEach(metric => {
    if (metric.type === 'TargetGroup') {
      metric.targetGroups.forEach((tg: ITargetGroup) => {
        const group = targetGroups[tg.name] ?? ({} as ITargetGroup);
        let port = group.port;

        if (group.healthCheckPort != null && group.healthCheckPort !== 'traffic-port') {
          port =
            typeof group.healthCheckPort === 'string' ? parseInt(group.healthCheckPort, 10) : group.healthCheckPort;
        }
        tg.healthCheckProtocol = group.healthCheckProtocol.toLowerCase();
        tg.healthCheckPath = `:${port}${group.healthCheckPath}`;
      });
    }
  });
};
