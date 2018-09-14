import {
  IPipeline,
  IStage,
  IStageOrTriggerTypeConfig,
  NameUtils,
  PipelineConfigService,
  IStageOrTriggerValidator,
  IValidatorConfig,
  PipelineConfigValidator,
} from '@spinnaker/core';

export interface ITargetImpedanceValidationConfig extends IValidatorConfig {
  stageTypes?: string[];
  stageType?: string;
  message: string;
}

export class CfTargetImpedanceValidator implements IStageOrTriggerValidator {
  public validate(
    pipeline: IPipeline,
    stage: IStage,
    validator: ITargetImpedanceValidationConfig,
    _config: IStageOrTriggerTypeConfig,
  ): string {
    const stagesToTest: IStage[] = PipelineConfigService.getAllUpstreamDependencies(pipeline, stage),
      regions: string[] = stage.regions || [];
    let allRegionsFound = true;

    regions.forEach(region => {
      let regionFound = false;
      stagesToTest.forEach(toTest => {
        if (toTest.type === 'deploy' && toTest.clusters && toTest.clusters.length) {
          toTest.clusters.forEach((cluster: any) => {
            const clusterName: string = NameUtils.getClusterName(
              cluster.application,
              cluster.stack,
              cluster.freeFormDetails,
            );
            if (clusterName === stage.cluster && cluster.account === stage.credentials && cluster.region === region) {
              regionFound = true;
            }
          });
        } else if (
          toTest.type === 'cloneServerGroup' &&
          toTest.targetCluster === stage.cluster &&
          toTest.region === region
        ) {
          regionFound = true;
        }
      });
      if (!regionFound) {
        allRegionsFound = false;
      }
    });
    if (!allRegionsFound) {
      return validator.message;
    }
    return null;
  }
}

PipelineConfigValidator.registerValidator('cfTargetImpedance', new CfTargetImpedanceValidator());
