import { SelectorKind } from './IManifestLabelSelector';
import { ManifestLabelSelectors } from './ManifestLabelSelectors';

describe('ManifestLabelSelectors', () => {
  describe('formatLabelSelector', () => {
    it('handles ANY', () => {
      const selector = {
        kind: SelectorKind.ANY,
      };
      expect(ManifestLabelSelectors.formatLabelSelector(selector)).toEqual(null);
    });

    it('handles EQUALS', () => {
      const selector = {
        key: 'environment',
        kind: SelectorKind.EQUALS,
        values: ['prod'],
      };
      expect(ManifestLabelSelectors.formatLabelSelector(selector)).toEqual('environment = prod');
    });

    it('handles NOT_EQUALS', () => {
      const selector = {
        key: 'environment',
        kind: SelectorKind.NOT_EQUALS,
        values: ['prod'],
      };
      expect(ManifestLabelSelectors.formatLabelSelector(selector)).toEqual('environment != prod');
    });

    it('handles CONTAINS', () => {
      const selector = {
        key: 'environment',
        kind: SelectorKind.CONTAINS,
        values: ['prod', 'staging'],
      };
      expect(ManifestLabelSelectors.formatLabelSelector(selector)).toEqual('environment in (prod, staging)');
    });

    it('handles NOT_CONTAINS', () => {
      const selector = {
        key: 'environment',
        kind: SelectorKind.NOT_CONTAINS,
        values: ['prod', 'staging'],
      };
      expect(ManifestLabelSelectors.formatLabelSelector(selector)).toEqual('environment notin (prod, staging)');
    });

    it('handles EXISTS', () => {
      const selector = {
        key: 'environment',
        kind: SelectorKind.EXISTS,
      };
      expect(ManifestLabelSelectors.formatLabelSelector(selector)).toEqual('environment');
    });

    it('handles NOT_EXISTS', () => {
      const selector = {
        key: 'environment',
        kind: SelectorKind.NOT_EXISTS,
      };
      expect(ManifestLabelSelectors.formatLabelSelector(selector)).toEqual('!environment');
    });
  });
});
