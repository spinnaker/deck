import { flatten, keyBy } from 'lodash';

export const getAllTargetGroups = loadBalancers => {
  const allTargetGroups = loadBalancers.map(d => d.targetGroups);
  const targetGroups = keyBy(flatten(allTargetGroups), 'name');
  return targetGroups;
};

export const applyHealthCheckInfoToTargetGroups = (healthMetrics, targetGroups) => {
  healthMetrics.forEach(metric => {
    if (metric.type === 'TargetGroup') {
      metric.targetGroups.forEach(tg => {
        const group = targetGroups[tg.name];
        tg.healthCheckProtocol = group.healthCheckProtocol.toLowerCase();
        tg.healthCheckPath = `:${group.healthCheckPort}${group.healthCheckPath}`;
      });
    }
  });
};
