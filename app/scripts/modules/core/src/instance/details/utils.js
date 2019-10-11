import { flatten } from 'lodash';

export const getAllTargetGroups = loadBalancers => {
  const allTargetGroups = loadBalancers.map(d => d.targetGroups);
  const targetGroups = flatten(allTargetGroups).reduce((groups, tg) => {
    groups[tg.name] = tg;
    return groups;
  }, {});

  return targetGroups;
};

export const getTargetGroupHealthCheckInfo = (healthMetrics, targetGroups) => {
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
