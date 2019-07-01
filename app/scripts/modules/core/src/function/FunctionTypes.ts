import { IFunctionModalProps } from '@spinnaker/core';

import { IAmazonFunctionUpsertCommand } from '../../../amazon/src/domain';
import { CreateLambdaFunction } from '../../../amazon/src/function/CreateLambdaFunction';
export interface ICloseableFunctionModal extends React.ComponentClass<IFunctionModalProps> {
  show: (props: IFunctionModalProps) => Promise<IAmazonFunctionUpsertCommand>;
}

export interface IAmazonFunctionConfig {
  type: string;
  label: string;
  sublabel: string;
  description: string;
  component: ICloseableFunctionModal;
}

export const FunctionTypes: IAmazonFunctionConfig[] = [
  {
    type: 'aws',
    label: 'AWS',
    sublabel: 'Lambda',
    description: 'Serverless compute service.',
    component: CreateLambdaFunction,
  },
  {
    type: 'something',
    label: 'Another Provider',
    sublabel: 'Gamma',
    description: '',
    component: CreateLambdaFunction,
  },
];
