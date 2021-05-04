export interface IHealthConstant {
  label: string;
  value: string;
}

export const HealthCheckList: IHealthConstant[] = [
  {
    label: 'Lambda Invocation',
    value: '$LAMBDA',
  },
];
