export interface ILabelSelector {
  key: string;
  kind: string;
  values: string[];
}

export interface ILabelSelectors {
  selectors: ILabelSelector[];
}

export const LabelKinds: string[] = [
  'ANY',
  'EQUALS',
  'NOT_EQUALS',
  'CONTAINS',
  'NOT_CONTAINS',
  'EXISTS',
  'NOT_EXISTS',
];
