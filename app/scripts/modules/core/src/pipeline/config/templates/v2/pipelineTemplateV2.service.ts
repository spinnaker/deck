import { IPipeline } from 'core/domain';

export class PipelineTemplateV2Service {
  public static isV2PipelineConfig(pipelineConfig: IPipeline): boolean {
    return pipelineConfig.schema === 'v2';
  }
}
