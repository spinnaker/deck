export enum SelectorKind {
  ANY = 'ANY',
  EQUALS = 'EQUALS',
  NOT_EQUALS = 'NOT_EQUALS',
  CONTAINS = 'CONTAINS',
  NOT_CONTAINS = 'NOT_CONTAINS',
  EXISTS = 'EXISTS',
  NOT_EXISTS = 'NOT_EXISTS',
}

export enum RequirementKind {
  EQUALITY_BASED = 'EQUALITY_BASED',
  SET_BASED = 'SET_BASED',
  EXISTENCE_BASED = 'EXISTENCE_BASED',
}

export interface IManifestLabelSelector {
  key?: string;
  kind: SelectorKind;
  values?: string[];
}

export interface IManifestLabelSelectors {
  selectors: IManifestLabelSelector[];
}
