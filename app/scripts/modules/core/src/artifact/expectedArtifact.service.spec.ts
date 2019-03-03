import { noop } from 'lodash';
import { ExpectedArtifactService } from './expectedArtifact.service';
import { IArtifact, IArtifactKindConfig } from 'core/domain';
import { Registry } from 'core/registry';

describe('ExpectedArtifactService', () => {
  describe('getKindConfig()', () => {
    const baseKindConfig = {
      typePattern: /base-type/,
      label: '',
      description: '',
      isDefault: false,
      isMatch: false,
      template: '',
      controller: noop,
    };
    const kindConfigs: IArtifactKindConfig[] = [
      {
        typePattern: /foo-type/,
        type: 'foo-type',
        key: 'foo',
        isMatch: true,
      },
      {
        typePattern: /foo-type/,
        type: 'foo-type',
        key: 'foo-default',
        isDefault: true,
      },
      {
        typePattern: /bar-type/,
        type: 'bar-type',
        key: 'bar',
        isMatch: true,
      },
      {
        typePattern: /bar-type/,
        type: 'bar-type',
        key: 'bar-default',
        isDefault: true,
      },
    ].map(k => ({ ...baseKindConfig, ...k }));
    beforeAll(() => {
      kindConfigs.forEach(kindConfig => Registry.pipeline.registerArtifactKind(kindConfig));
    });

    it('infers kind from type', () => {
      const artifact: IArtifact = {
        id: 'artifact-id',
        type: 'bar-type',
      };
      const kindConfig = ExpectedArtifactService.getKindConfig(artifact, false);
      expect(kindConfig).toEqual(kindConfigs[2]);
    });

    it('infers kind from type when isDefault is true', () => {
      const artifact: IArtifact = {
        id: 'artifact-id',
        type: 'bar-type',
      };
      const kindConfig = ExpectedArtifactService.getKindConfig(artifact, true);
      expect(kindConfig).toEqual(kindConfigs[3]);
    });
  });
});
