import { IController, IHttpService, IRequestConfig } from 'angular';
import { IPipeline } from 'core/domain';
import { SETTINGS } from 'core/config/settings';

export interface IConvertToTemplateModalCommand {
  pipelineTemplate: string;
}

export class ConvertToTemplateModalCtrl implements IController {

  public command: IConvertToTemplateModalCommand;

  constructor(private $http: IHttpService,
              private pipeline: IPipeline) {
    'ngInject';
  }

  public $onInit(): void {
    this.command = {
      pipelineTemplate: '',
    };
    this.convertToTemplate(this.pipeline.application, this.pipeline.name)
  }

  public convertToTemplate(applicationName: string, pipelineName: string): void {
    const config: IRequestConfig = {
      method: 'GET',
      url: `${SETTINGS.gateUrl}/applications/${applicationName}/pipelineConfigs/${pipelineName}/convertToTemplate`,
      transformResponse: [(data) => data]
    };
    this.$http(config)
    .then((result: any) => {
      this.command.pipelineTemplate = result.data;
    }).catch(() => {});
  }
}
