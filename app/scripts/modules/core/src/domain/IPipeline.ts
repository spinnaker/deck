import { IStage } from './IStage';
import { ITrigger } from './ITrigger';
import { IExpectedArtifact } from 'core/domain/IExpectedArtifact';
import { IEntityTags } from './IEntityTags';

export interface IPipeline {
  application: string;
  description?: string;
  entityTags?: IEntityTags;
  id: string;
  index: number;
  isNew?: boolean;
  keepWaitingPipelines: boolean;
  lastModifiedBy?: string;
  locked?: boolean;
  limitConcurrent: boolean;
  name: string;
  respectQuietPeriod?: boolean;
  stages: IStage[];
  strategy: boolean;
  triggers: ITrigger[];
  parameterConfig: IParameter[];
  disabled?: boolean;
  expectedArtifacts?: IExpectedArtifact[];
  source?: {
    id: string;
    type: string;
  };
  type?: string;
}

export interface IParameter {
  name: string;
  description: string;
  default: string;
  hasOptions: boolean;
  options: IParameterOption[];
  condition?: IParameterCondition;
}

export interface IParameterCondition {
  parameter: string;
  comparator: '>' | '<' | '>=' | '<=' | '=' | '!=';
  comparatorValue: string | number;
}

export interface IParameterOption {
  value: string;
}

export interface IPipelineCommand {
  extraFields?: { [key: string]: any };
  pipeline: IPipeline;
  trigger: ITrigger;
  notificationEnabled: boolean;
  notification: {
    type: string;
    address: string;
    when: string[];
  };
  pipelineName: string;
}
