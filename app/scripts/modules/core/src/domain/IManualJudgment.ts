export interface IManualJudgment {
  [key: string]: Array<{ id?: string; name: string; pipelineId?: string; app?: string; currentChild?: string }>;
}
