import { PipelineRegistry } from '@spinnaker/core';

export interface Init {
  (registry: StageRegistry): void;
}

export interface StageRegistry {
  pipeline: PipelineRegistry;
}

declare global {
  interface Window {
    spinnakerSettings: any;
  }
}
