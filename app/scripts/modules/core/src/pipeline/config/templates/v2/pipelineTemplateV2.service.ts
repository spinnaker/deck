import { UUIDGenerator } from 'core/utils';
import { hri as HumanReadableIds } from 'human-readable-ids';
import { IPipeline, IPipelineTemplateV2 } from 'core/domain';

export class PipelineTemplateV2Service {
  public static createPipelineTemplate(pipeline: IPipeline, owner: string): IPipelineTemplateV2 {
    return {
      id: UUIDGenerator.generateUuid(),
      metadata: {
        description: `A pipeline template derived from pipeline "${pipeline.name}" in application "${
          pipeline.application
        }"`,
        name: HumanReadableIds.random(),
        owner,
        scopes: ['global'],
      },
      pipeline,
      protect: false,
      schema: 'v2',
      variables: [],
    };
  }
}
