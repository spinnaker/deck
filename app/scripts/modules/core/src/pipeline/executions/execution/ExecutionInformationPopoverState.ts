import { API } from 'core/api/ApiService';
import { ExecutionsTransformer } from '../../service/ExecutionsTransformer';
import { IExecution, IPipeline } from 'core/domain';

export class ExecutionInformationPopoverState {
  private static instance: ExecutionInformationPopoverState;
  private calledExecutions: { [key: string]: IExecution };
  private calledPipelineConfigs: { [key: string]: IPipeline[] };

  constructor() {
    if (!ExecutionInformationPopoverState.instance) {
      this.calledExecutions = {};
      this.calledPipelineConfigs = {};

      ExecutionInformationPopoverState.instance = this;
    }

    return ExecutionInformationPopoverState.instance;
  }

  public getExecution = async (executionId: string): Promise<IExecution> => {
    if (this.calledExecutions.hasOwnProperty(executionId)) {
      return this.calledExecutions[executionId];
    }

    const execution = await API.one('pipelines', executionId).get();
    // store for later
    this.calledExecutions[executionId] = execution;

    // convert the IExecutionStage => IExecutionStageSummary
    ExecutionsTransformer.processStageSummaries(execution);

    return execution;
  };

  public getPipelineConfig = async (application: string, pipelineConfigId: string): Promise<IPipeline> => {
    let pipelineConfig;
    if (this.calledPipelineConfigs.hasOwnProperty(application)) {
      pipelineConfig = this.calledPipelineConfigs[application].find(
        (config: IPipeline) => config.id === pipelineConfigId,
      );

      return pipelineConfig;
    }

    const pipelineConfigs = await API.one('applications', application, 'pipelineConfigs').get();
    // store for later
    this.calledPipelineConfigs[application] = pipelineConfigs;

    pipelineConfig = this.calledPipelineConfigs[application].find(
      (config: IPipeline) => config.id === pipelineConfigId,
    );

    return pipelineConfig;
  };
}
