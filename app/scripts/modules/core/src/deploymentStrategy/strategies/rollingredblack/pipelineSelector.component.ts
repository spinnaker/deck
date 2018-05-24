import { IController, IComponentOptions, module } from 'angular';

import { ApplicationReader } from 'core/application/service/ApplicationReader';
import { IParameter, IPipeline } from 'core/domain';
import { PipelineConfigService } from 'core/pipeline/config/services/PipelineConfigService';

interface IPipelineSelectorState {
  pipelinesLoaded: boolean;
  applications: string[];
  pipelines: IPipeline[];
  pipelineParameters?: IParameter[];
  useDefaultParameters: { [key: string]: boolean };
  userSuppliedParameters: { [key: string]: any };
  currentApplicationCount: number;
}

interface IPipelineSelectorCommand {
  application?: string;
  pipelineId?: string;
  pipelineParameters?: { [key: string]: any };
}

class PipelineSelectorController implements IController {
  public command: IPipelineSelectorCommand;
  public state: IPipelineSelectorState = {
    pipelinesLoaded: false,
    applications: [],
    pipelines: [],
    pipelineParameters: [],
    useDefaultParameters: {},
    userSuppliedParameters: {},
    currentApplicationCount: 20,
  };

  public $onInit() {
    ApplicationReader.listApplications().then(applications => {
      this.state.applications = applications.map(a => a.name).sort();
      this.initializePipelines();
    });
  }

  public addMoreApplications(): void {
    this.state.currentApplicationCount += 20;
  }

  public initializePipelines(): void {
    if (this.command.application) {
      PipelineConfigService.getPipelinesForApplication(this.command.application).then(pipelines => {
        this.state.pipelines = pipelines;
        if (pipelines.every(p => p.id !== this.command.pipelineId)) {
          this.command.pipelineId = null;
        }
        this.state.pipelinesLoaded = true;
        this.updatePipelineConfig();
      });
    }
  }

  public updatePipelineConfig(): void {
    if (this.command && this.command.application && this.command.pipelineId) {
      const config = this.state.pipelines.find(p => p.id === this.command.pipelineId);
      if (config && config.parameterConfig) {
        if (!this.command.pipelineParameters) {
          this.command.pipelineParameters = {};
        }
        this.state.pipelineParameters = config.parameterConfig;
        this.state.userSuppliedParameters = this.command.pipelineParameters;
        this.state.useDefaultParameters = {};
        this.configureParamDefaults();
      } else {
        this.clearParams();
      }
    } else {
      this.clearParams();
    }
  }

  public updateParam(parameter: string): void {
    if (this.state.useDefaultParameters[parameter] === true) {
      delete this.state.userSuppliedParameters[parameter];
      delete this.command.pipelineParameters[parameter];
    } else if (this.state.userSuppliedParameters[parameter]) {
      this.command.pipelineParameters[parameter] = this.state.userSuppliedParameters[parameter];
    }
  }

  private configureParamDefaults(): void {
    this.state.pipelineParameters.forEach((param: any) => {
      const defaultValue = param.default;
      if (defaultValue !== null && defaultValue !== undefined) {
        const configuredParamValue = this.command.pipelineParameters[param.name];
        if (configuredParamValue === undefined || configuredParamValue === defaultValue) {
          this.state.useDefaultParameters[param.name] = true;
          this.command.pipelineParameters[param.name] = defaultValue;
        }
      }
    });
  }

  private clearParams(): void {
    this.state.pipelineParameters = [];
    this.state.useDefaultParameters = {};
    this.state.userSuppliedParameters = {};
  }
}

const pipelineSelectorComponent: IComponentOptions = {
  bindings: {
    command: '=',
  },
  templateUrl: require('./pipelineSelector.component.html'),
  controller: PipelineSelectorController,
};

export const PIPELINE_SELECTOR_COMPONENT = 'spinnaker.core.deploymentStrategy.rollingredblack.pipelineSelector';
module(PIPELINE_SELECTOR_COMPONENT, []).component('pipelineSelector', pipelineSelectorComponent);
