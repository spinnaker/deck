import { auto, IServiceProvider, module } from 'angular';
import { cloneDeep, intersection, memoize } from 'lodash';
import { $log } from 'ngimport';


import { Application } from 'core/application/application.model';
import { IExecution, IStage } from 'core/domain';
import { ITriggerTypeConfig, IStageTypeConfig } from './validation/pipelineConfig.validator';
import { SETTINGS } from 'core/config/settings';

export interface ITransformer {
  transform: (application: Application, execution: IExecution) => void;
};

export class PipelineConfigProvider implements IServiceProvider {
  private $injector: auto.IInjectorService;

  private triggerTypes: ITriggerTypeConfig[] = [];
  private stageTypes: IStageTypeConfig[] = [];
  private transformers: ITransformer[] = [];

  constructor() {
    this.getStageConfig = memoize(this.getStageConfig.bind(this),
      (stage: IStage) => [stage ? stage.type : '', stage ? stage.cloudProvider || stage.cloudProviderType || 'aws' : ''].join(':'));
  }

  private normalizeStageTypes(): void {
    this.stageTypes
      .filter((stageType) => { return stageType.provides; })
      .forEach((stageType) => {
        const parent = this.stageTypes.filter((parentType) => {
          return parentType.key === stageType.provides && !parentType.provides;
        });
        if (parent.length) {
          stageType.label = stageType.label || parent[0].label;
          stageType.description = stageType.description || parent[0].description;
          stageType.key = stageType.key || parent[0].key;
        }
      });
  }

  public registerTrigger(triggerConfig: ITriggerTypeConfig): void {
    if (SETTINGS.triggerTypes) {
      if (SETTINGS.triggerTypes.indexOf(triggerConfig.key) >= 0) {
        this.triggerTypes.push(triggerConfig);
      }
    } else {
      this.triggerTypes.push(triggerConfig);
    }
  }

  public registerTransformer(transformer: ITransformer): void {
    this.transformers.push(transformer);
  }

  public registerStage(stageConfig: IStageTypeConfig): void {
    this.stageTypes.push(stageConfig);
    this.normalizeStageTypes();
  }

  public getExecutionTransformers(): ITransformer[] {
    return this.transformers;
  }

  public getTriggerTypes(): ITriggerTypeConfig[] {
    return cloneDeep(this.triggerTypes);
  }

  public getStageTypes(): IStageTypeConfig[] {
    return cloneDeep(this.stageTypes);
  }

  private getCloudProvidersForStage(type: IStageTypeConfig, allStageTypes: IStageTypeConfig[], providers: string[]): string[] {
    let cloudProviders: string[] = [];
    if (type.providesFor) {
      cloudProviders = type.providesFor;
    } else if (type.cloudProvider) {
      cloudProviders = [type.cloudProvider];
    } else if (type.useBaseProvider) {
      const stageProviders: IStageTypeConfig[] = allStageTypes.filter(s => s.provides === type.key);
      stageProviders.forEach(sp => {
        if (sp.providesFor) {
          cloudProviders = cloudProviders.concat(sp.providesFor);
        } else {
          cloudProviders.push(sp.cloudProvider);
        }
      });
    } else {
      cloudProviders = providers;
    }
    // Docker Bake is wedged in here because it doesn't really fit our existing cloud provider paradigm
    const dockerBakeEnabled = SETTINGS.feature.dockerBake && type.key === 'bake';

    if (dockerBakeEnabled) {
      providers = cloneDeep(providers);
      providers.push('docker');
    }

    return intersection(providers, cloudProviders);
  }


  public getConfigurableStageTypes(providers?: string[]): IStageTypeConfig[] {
    const allStageTypes = this.getStageTypes();
    const configurableStageTypes = allStageTypes.filter(stageType => !stageType.synthetic && !stageType.provides);
    if (!providers) {
      return configurableStageTypes;
    }
    configurableStageTypes.forEach(type => type.cloudProviders = this.getCloudProvidersForStage(type, allStageTypes, providers));
    return configurableStageTypes
      .filter(stageType => stageType.cloudProviders.length)
      .sort((a, b) => a.label.localeCompare(b.label));
  }

  public getProvidersFor(key: string): IStageTypeConfig[] {
    // because the key might be the implementation itself, determine the base key, then get every provider for it
    let baseKey = key;
    const stageTypes = this.getStageTypes();
    const candidates = stageTypes.filter((stageType: IStageTypeConfig) => {
      return stageType.provides && (stageType.provides === key || stageType.key === key || stageType.alias === key);
    });
    if (candidates.length) {
      baseKey = candidates[0].provides;
    }
    return this.getStageTypes().filter((stageType) => {
      return stageType.provides && stageType.provides === baseKey;
    });
  }

  public getTriggerConfig(type: string): ITriggerTypeConfig {
    return this.getTriggerTypes().find((triggerType) => triggerType.key === type);
  }

  public overrideManualExecutionHandler(triggerType: string, handlerName: string): void {
    const triggerConfig = this.triggerTypes.find(t => t.key === triggerType);
    if (triggerConfig) {
      triggerConfig.manualExecutionHandler = handlerName;
    }
  }

  public getStageConfig(stage: IStage): IStageTypeConfig {
    if (!stage || !stage.type) {
      return null;
    }
    const matches = this.getStageTypes().filter((stageType) => {
      return stageType.key === stage.type || stageType.provides === stage.type || stageType.alias === stage.type;
    });

    switch (matches.length) {
      case 0:
        return this.getStageTypes().find(s => s.key === 'unmatched') || null;
      case 1:
        return matches[0];
      default:
        const provider = stage.cloudProvider || 'aws';
        const matchesForStageCloudProvider = matches.filter(stageType => {
          return stageType.cloudProvider === provider;
        });

        if (!matchesForStageCloudProvider.length) {
          return matches.find(stageType => {
            return !!stageType.cloudProvider;
          }) || null;
        } else {
          return matchesForStageCloudProvider[0];
        }
    }
  }

  public getManualExecutionHandlerForTriggerType(triggerType: string): string {
    const triggerConfig = this.getTriggerConfig(triggerType);
    if (triggerConfig && triggerConfig.manualExecutionHandler) {
      if (this.$injector.has(triggerConfig.manualExecutionHandler)) {
        return this.$injector.get<string>(triggerConfig.manualExecutionHandler);
      }
    }
    return null;
  }

  public hasManualExecutionHandlerForTriggerType(triggerType: string): boolean {
    let hasHandler = false;
    const triggerConfig = this.getTriggerConfig(triggerType);
    if (triggerConfig && triggerConfig.manualExecutionHandler) {
      hasHandler = this.$injector.has(triggerConfig.manualExecutionHandler);
      if (!hasHandler) {
        $log.warn(`Could not find execution handler '${triggerConfig.manualExecutionHandler}' for trigger type '${triggerType}'`);
      }
    }
    return hasHandler;
  }

  public $get($injector: auto.IInjectorService): PipelineConfigProvider {
    this.$injector = $injector;
    return this;
  }
}

export let pipelineConfig: PipelineConfigProvider = undefined;
export const PIPELINE_CONFIG_PROVIDER = 'spinnaker.core.pipeline.config.configProvider';
module(PIPELINE_CONFIG_PROVIDER, [])
  .provider('pipelineConfig', PipelineConfigProvider)
  .run(($injector: auto.IInjectorService) => pipelineConfig = <PipelineConfigProvider>$injector.get('pipelineConfig'));
