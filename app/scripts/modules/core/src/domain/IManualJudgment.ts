export interface IManualJudgment {
  [key: string]: IManualJudgmentConfig[];
}

export interface IManualJudgmentConfig {
  id?: string;
  name: string;
  pipelineId?: string;
  app?: string;
  currentChild?: string;
}
