import { IAutoscaler } from '@spinnaker/core';

export interface IKubernetesAutoscaler extends IAutoscaler {
  createdTime: number;
  kind: string;
  displayName: string;
  apiVersion: string;
  manifest: any;
  namespace: string;
}
