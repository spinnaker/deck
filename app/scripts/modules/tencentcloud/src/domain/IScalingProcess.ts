export interface IScalingProcess {
  name: string;
  enabled?: boolean;
  description: string;
  suspensionDate?: number;
  reason?: string;
}

export interface ISuspendedProcess {
  processName: string;
  suspensionReason: string;
}
