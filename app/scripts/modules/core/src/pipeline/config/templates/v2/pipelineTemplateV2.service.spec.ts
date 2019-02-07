import { PipelineTemplateV2Service } from './pipelineTemplateV2.service';
import { IPipeline, IPipelineTemplateV2 } from 'core/domain';
import { UUIDGenerator } from 'core/utils';
import { hri as HumanReadableIds } from 'human-readable-ids';

describe('PipelineTemplateV2Service', () => {
  describe('createPipelineTemplate()', () => {
    const mockId = 'd952f77c-b043-4e3d-950c-873992dcd689';
    const mockName = 'my-template-1';
    const mockOwner = 'example@example.com';
    const mockPipeline: Partial<IPipeline> = {
      application: 'test-application',
      name: 'test-pipeline',
    };

    const mockTemplate: IPipelineTemplateV2 = {
      id: mockId,
      metadata: {
        description: `A pipeline template derived from pipeline "${mockPipeline.name}" in application "${
          mockPipeline.application
        }"`,
        name: mockName,
        owner: mockOwner,
        scopes: ['global'],
      },
      pipeline: mockPipeline as IPipeline,
      protect: false,
      schema: 'v2',
      variables: [],
    };

    beforeAll(() => {
      spyOn(UUIDGenerator, 'generateUuid').and.returnValue(mockId);
      spyOn(HumanReadableIds, 'random').and.returnValue(mockName);
    });

    it('returns a template successfully', () => {
      const template = PipelineTemplateV2Service.createPipelineTemplate(mockPipeline as IPipeline, mockOwner);
      expect(template).toEqual(mockTemplate);
    });
  });
});
