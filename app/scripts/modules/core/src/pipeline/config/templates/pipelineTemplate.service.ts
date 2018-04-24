import { module, IPromise, IQService } from 'angular';
import { flatten } from 'lodash';
import { API } from 'core/api/ApiService';
import { IPipeline } from 'core/domain/IPipeline';
import { BindAll } from 'lodash-decorators';

export interface IPipelineTemplate {
  id: string;
  selfLink?: string;
  metadata: ITemplateMetadata;
  protect: boolean;
  schema: string;
  source: string;
  stages: ITemplateStage[];
  variables: IVariableMetadata[];
}

export interface ITemplateMetadata {
  description: string;
  name: string;
  owner: string;
}

export interface IVariableMetadata {
  defaultValue?: any;
  description?: string;
  example?: string;
  group?: string;
  name: string;
  type: VariableType;
}

export type VariableType = 'int' | 'float' | 'list' | 'object' | 'string' | 'boolean';

export interface ITemplateStage {
  dependsOn: string[];
  id: string;
  name: string;
  type: string;
}

export interface IPipelineTemplateConfig extends Partial<IPipeline> {
  type: string;
  plan?: boolean;
  config: {
    schema: string;
    pipeline: {
      name: string;
      application: string;
      pipelineConfigId?: string;
      template: {
        source: string;
      };
      variables?: { [key: string]: any };
    };
  };
}

export interface IPipelineTemplatePlanResponse {
  errors: IPipelineTemplatePlanError[];
  message: string;
  status: string;
}

export interface IPipelineTemplatePlanError {
  severity: string;
  message: string;
  location: string;
  cause: string;
  suggestion: string;
  details: { [key: string]: string };
  nestedErrors: IPipelineTemplatePlanError[];
}

@BindAll()
export class PipelineTemplateService {
  constructor(private $q: IQService) {
    'ngInject';
  }

  public getPipelineTemplateFromSourceUrl(
    source: string,
    executionId?: String,
    pipelineConfigId?: string,
  ): IPromise<IPipelineTemplate> {
    return API.one('pipelineTemplates')
      .one('resolve')
      .withParams({ source, executionId, pipelineConfigId })
      .get()
      .then((template: IPipelineTemplate) => {
        template.selfLink = source;
        return template;
      });
  }

  public getPipelinePlan(config: IPipelineTemplateConfig, executionId?: String): IPromise<IPipeline> {
    return API.one('pipelines')
      .one('start')
      .post({ ...config, plan: true, executionId });
  }

  public getPipelineTemplatesByScope(scope: string): IPromise<IPipelineTemplate[]> {
    return API.one('pipelineTemplates')
      .withParams({ scope })
      .get();
  }

  public getPipelineTemplatesByScopes(scopes: string[]): IPromise<IPipelineTemplate[]> {
    return this.$q
      .all(scopes.map(this.getPipelineTemplatesByScope))
      .then(templates => flatten(templates))
      .then(templates => {
        templates.forEach(template => (template.selfLink = `spinnaker://${template.id}`));
        return templates;
      });
  }
}

export const PIPELINE_TEMPLATE_SERVICE = 'spinnaker.core.pipelineTemplate.service';
module(PIPELINE_TEMPLATE_SERVICE, []).service('pipelineTemplateService', PipelineTemplateService);
