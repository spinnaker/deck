import { IManifestLabelSelector, SelectorKind, RequirementKind } from './IManifestLabelSelector';

export class ManifestLabelSelectors {
  public static getRequirementKind(selectorKind: SelectorKind): RequirementKind {
    switch (selectorKind) {
      case SelectorKind.EXISTS:
        return RequirementKind.EXISTENCE_BASED;
      case SelectorKind.NOT_EXISTS:
        return RequirementKind.EXISTENCE_BASED;
      case SelectorKind.CONTAINS:
        return RequirementKind.SET_BASED;
      case SelectorKind.NOT_CONTAINS:
        return RequirementKind.SET_BASED;
      case SelectorKind.EQUALS:
        return RequirementKind.EQUALITY_BASED;
      case SelectorKind.NOT_EQUALS:
        return RequirementKind.EQUALITY_BASED;
      default:
        return null;
    }
  }

  public static formatLabelSelector(selector: IManifestLabelSelector): string {
    const { key, kind, values = [] } = selector;
    switch (kind) {
      case SelectorKind.ANY:
        return null;
      case SelectorKind.EQUALS:
        return `${key} = ${values[0]}`;
      case SelectorKind.NOT_EQUALS:
        return `${key} != ${values[0]}`;
      case SelectorKind.CONTAINS:
        return `${key} in (${values.join(', ')})`;
      case SelectorKind.NOT_CONTAINS:
        return `${key} notin (${values.join(', ')})`;
      case SelectorKind.EXISTS:
        return `${key}`;
      case SelectorKind.NOT_EXISTS:
        return `!${key}`;
      default:
        return null;
    }
  }
}
