import { IDeploymentStrategy } from 'core/deploymentStrategy';

export const strategyNone: IDeploymentStrategy = {
  label: 'None',
  description: 'Creates the new ReplicaSet with no impact on existing ReplicaSets in the cluster',
  key: null,
  providerRestricted: false,
};
