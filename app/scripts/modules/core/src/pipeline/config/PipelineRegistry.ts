import { get, uniq, isNil, cloneDeep, intersection, memoize, defaults } from 'lodash';

import { Application } from 'core/application/application.model';
import {
  IExecution,
  INotificationTypeConfig,
  IStage,
  ITriggerTypeConfig,
  IStageTypeConfig,
  IArtifactKindConfig,
  IStageOrTriggerTypeConfig,
  IArtifactEditorProps,
} from 'core/domain';
import { CloudProviderRegistry, ICloudProviderConfig } from 'core/cloudProvider';
import { SETTINGS } from 'core/config/settings';
import { IAccountDetails } from 'core/account/AccountService';

import { ITriggerTemplateComponentProps } from '../manualExecution/TriggerTemplate';
import { ComponentType, SFC } from 'react';
import { artifactKindConfigs } from './triggers/artifacts';

export interface ITransformer {
  transform: (application: Application, execution: IExecution) => void;
}

export class PipelineRegistry {
  private triggerTypes: ITriggerTypeConfig[] = [];
  private stageTypes: IStageTypeConfig[] = [];
  private transformers: ITransformer[] = [];
  private notificationTypes: INotificationTypeConfig[] = [];
  private artifactKinds: IArtifactKindConfig[] = artifactKindConfigs;
  private customArtifactKind: IArtifactKindConfig;

  constructor() {
    this.getStageConfig = memoize(this.getStageConfig.bind(this), (stage: IStage) =>
      [stage ? stage.type : '', stage ? PipelineRegistry.resolveCloudProvider(stage) : ''].join(':'),
    );
  }

  private normalizeStageTypes(): void {
    this.stageTypes
      .filter(stageType => {
        return stageType.provides;
      })
      .forEach(stageType => {
        const parent = this.stageTypes.find(parentType => {
          return parentType.key === stageType.provides && !parentType.provides;
        });
        if (parent) {
          stageType.label = stageType.label || parent.label;
          stageType.description = stageType.description || parent.description;
          stageType.key = stageType.key || parent.key;
          stageType.manualExecutionComponent = stageType.manualExecutionComponent || parent.manualExecutionComponent;

          // Optional parameters
          if (parent.executionDetailsUrl && !stageType.executionDetailsUrl) {
            stageType.executionDetailsUrl = parent.executionDetailsUrl;
          }
          if (parent.executionConfigSections && !stageType.executionConfigSections) {
            stageType.executionConfigSections = parent.executionConfigSections;
          }
          if (parent.executionDetailsSections && !stageType.executionDetailsSections) {
            stageType.executionDetailsSections = parent.executionDetailsSections;
          }
        }
      });
  }

  public registerNotification(notificationConfig: INotificationTypeConfig): void {
    if (SETTINGS.notifications) {
      const notificationSetting: { enabled: boolean; botName?: string } = get(
        SETTINGS.notifications,
        notificationConfig.key,
      );
      if (notificationSetting && notificationSetting.enabled) {
        const config = cloneDeep(notificationConfig);
        config.config = { ...notificationSetting };
        this.notificationTypes.push(config);
      }
    } else {
      this.notificationTypes.push(notificationConfig);
    }
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

  public registerArtifactKind(
    artifactKindConfig: IArtifactKindConfig,
  ): ComponentType<IArtifactEditorProps> | SFC<IArtifactEditorProps> {
    this.artifactKinds.push(artifactKindConfig);
    return artifactKindConfig.editCmp;
  }

  public mergeArtifactKind(artifactKindConfig: IArtifactKindConfig): void {
    const index = this.artifactKinds.findIndex(ak => ak.key === artifactKindConfig.key);
    if (index === -1) {
      throw new Error(`could not find existing artifact kind config for key ${artifactKindConfig.key}`);
    }
    const originalArtifactKind = this.artifactKinds[index];
    defaults(originalArtifactKind, artifactKindConfig);
  }

  public registerCustomArtifactKind(artifactKindConfig: IArtifactKindConfig): void {
    this.customArtifactKind = artifactKindConfig;
    this.registerArtifactKind(artifactKindConfig);
  }

  public getExecutionTransformers(): ITransformer[] {
    return this.transformers;
  }

  public getNotificationTypes(): INotificationTypeConfig[] {
    return cloneDeep(this.notificationTypes);
  }

  public getTriggerTypes(): ITriggerTypeConfig[] {
    return cloneDeep(this.triggerTypes);
  }

  public getStageTypes(): IStageTypeConfig[] {
    return cloneDeep(this.stageTypes);
  }

  public getMatchArtifactKinds(): IArtifactKindConfig[] {
    return cloneDeep(this.artifactKinds.filter(k => k.isMatch));
  }

  public getDefaultArtifactKinds(): IArtifactKindConfig[] {
    return cloneDeep(this.artifactKinds.filter(k => k.isDefault));
  }

  public getCustomArtifactKind(): IArtifactKindConfig {
    return cloneDeep(this.customArtifactKind);
  }

  private getCloudProvidersForStage(
    type: IStageTypeConfig,
    allStageTypes: IStageTypeConfig[],
    accounts: IAccountDetails[],
  ): string[] {
    const providersFromAccounts = uniq(accounts.map(acc => acc.cloudProvider));
    let providersFromStage: string[] = [];
    if (type.providesFor) {
      providersFromStage = type.providesFor;
    } else if (type.cloudProvider) {
      providersFromStage = [type.cloudProvider];
    } else if (type.useBaseProvider) {
      const stageProviders: IStageTypeConfig[] = allStageTypes.filter(s => s.provides === type.key);
      stageProviders.forEach(sp => {
        if (sp.providesFor) {
          providersFromStage = providersFromStage.concat(sp.providesFor);
        } else {
          providersFromStage.push(sp.cloudProvider);
        }
      });
    } else {
      providersFromStage = providersFromAccounts.slice(0);
    }

    // Remove a provider if none of the given accounts support the stage type.
    providersFromStage = providersFromStage.filter((providerKey: string) => {
      const providerAccounts = accounts.filter(acc => acc.cloudProvider === providerKey);
      return !!providerAccounts.find(acc => {
        const provider = CloudProviderRegistry.getProvider(acc.cloudProvider, acc.skin);
        return !isExcludedStageType(type, provider);
      });
    });

    // Docker Bake is wedged in here because it doesn't really fit our existing cloud provider paradigm
    if (SETTINGS.feature.dockerBake && type.key === 'bake') {
      providersFromAccounts.push('docker');
    }

    return intersection(providersFromAccounts, providersFromStage);
  }

  public getConfigurableStageTypes(accounts?: IAccountDetails[]): IStageTypeConfig[] {
    const providers: string[] = isNil(accounts) ? [] : Array.from(new Set(accounts.map(a => a.cloudProvider)));
    const allStageTypes = this.getStageTypes();
    let configurableStageTypes = allStageTypes.filter(stageType => !stageType.synthetic && !stageType.provides);
    if (providers.length === 0) {
      return configurableStageTypes;
    }
    configurableStageTypes.forEach(
      type => (type.cloudProviders = this.getCloudProvidersForStage(type, allStageTypes, accounts)),
    );
    configurableStageTypes = configurableStageTypes.filter(type => {
      return !accounts.every(a => {
        const p = CloudProviderRegistry.getProvider(a.cloudProvider, a.skin);
        return isExcludedStageType(type, p);
      });
    });
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
    return this.getStageTypes().filter(stageType => {
      return stageType.provides && stageType.provides === baseKey;
    });
  }

  public getNotificationConfig(type: string): INotificationTypeConfig {
    return this.getNotificationTypes().find(notificationType => notificationType.key === type);
  }

  public getTriggerConfig(type: string): ITriggerTypeConfig {
    return this.getTriggerTypes().find(triggerType => triggerType.key === type);
  }

  public overrideManualExecutionComponent(
    triggerType: string,
    component: React.ComponentType<ITriggerTemplateComponentProps>,
  ): void {
    const triggerConfig = this.triggerTypes.find(t => t.key === triggerType);
    if (triggerConfig) {
      triggerConfig.manualExecutionComponent = component;
    }
  }

  /**
   * Checks stage.type against stageType.alias to match stages that may have run as a legacy type.
   * StageTypes set alias='legacyName' for backwards compatibility
   * @param stage
   */
  private checkAliasedStageTypes(stage: IStage): IStageTypeConfig {
    const aliasedMatches = this.getStageTypes().filter(stageType => stageType.alias === stage.type);
    if (aliasedMatches.length === 1) {
      return aliasedMatches[0];
    }
    return null;
  }

  /**
   * Checks stage.alias against stageType.key to gracefully degrade redirected stages
   * For stages that don't actually exist in orca, if we couldn't find a match for them in deck either
   * (i.e. deprecated/deleted) this allows us to fallback to the stage type that actually ran in orca
   * @param stage
   */
  private checkAliasFallback(stage: IStage): IStageTypeConfig {
    if (stage.alias) {
      // Allow fallback to an exact match with stage.alias
      const aliasMatches = this.getStageTypes().filter(stageType => stageType.key === stage.alias);
      if (aliasMatches.length === 1) {
        return aliasMatches[0];
      }
    }
    return null;
  }

  public getStageConfig(stage: IStage): IStageTypeConfig {
    if (!stage || !stage.type) {
      return null;
    }
    const matches = this.getStageTypes().filter(stageType => {
      return stageType.key === stage.type || stageType.provides === stage.type;
    });

    switch (matches.length) {
      case 0:
        // There are really only 2 usages for 'alias':
        // - to allow deck to still find a match for legacy stage types
        // - to have stages that actually run as their 'alias' in orca (addAliasToConfig) because their 'key' doesn't actually exist
        const aliasMatch = this.checkAliasedStageTypes(stage) || this.checkAliasFallback(stage);
        if (aliasMatch) {
          return aliasMatch;
        }
        return this.getStageTypes().find(s => s.key === 'unmatched') || null;
      case 1:
        return matches[0];
      default: {
        const provider = PipelineRegistry.resolveCloudProvider(stage);
        const matchesForStageCloudProvider = matches.filter(stageType => {
          return stageType.cloudProvider === provider;
        });

        if (!matchesForStageCloudProvider.length) {
          return (
            matches.find(stageType => {
              return !!stageType.cloudProvider;
            }) || null
          );
        } else {
          return matchesForStageCloudProvider[0];
        }
      }
    }
  }

  // IStage doesn't have a cloudProvider field yet many stage configs are setting it.
  // Some stages (RunJob, ?) are only setting the cloudProvider field in stage.context.
  private static resolveCloudProvider(stage: IStage): string {
    return (
      stage.cloudProvider ||
      stage.cloudProviderType ||
      get(stage, ['context', 'cloudProvider']) ||
      get(stage, ['context', 'cloudProviderType']) ||
      'aws'
    );
  }

  private getManualExecutionComponent(
    config: IStageOrTriggerTypeConfig,
  ): React.ComponentType<ITriggerTemplateComponentProps> {
    if (config && config.manualExecutionComponent) {
      return config.manualExecutionComponent;
    }
    return null;
  }

  public getManualExecutionComponentForTriggerType(
    triggerType: string,
  ): React.ComponentType<ITriggerTemplateComponentProps> {
    return this.getManualExecutionComponent(this.getTriggerConfig(triggerType));
  }

  public hasManualExecutionComponentForTriggerType(triggerType: string): boolean {
    return this.getManualExecutionComponent(this.getTriggerConfig(triggerType)) !== null;
  }

  public getManualExecutionComponentForStage(stage: IStage): React.ComponentType<ITriggerTemplateComponentProps> {
    return this.getStageConfig(stage).manualExecutionComponent;
  }
}

function isExcludedStageType(type: IStageTypeConfig, provider: ICloudProviderConfig) {
  if (!provider || !provider.unsupportedStageTypes) {
    return false;
  }
  return provider.unsupportedStageTypes.indexOf(type.key) > -1;
}
