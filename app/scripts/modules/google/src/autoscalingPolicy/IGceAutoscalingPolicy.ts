export interface IGceAutoscalingPolicy {
  scaleInControl: IGceScaleInControl;
}

export interface IGceScaleInControl {
  maxScaledInReplicas?: {
    fixed?: number;
    percent?: number;
  };
  timeWindowSec?: number;
}
