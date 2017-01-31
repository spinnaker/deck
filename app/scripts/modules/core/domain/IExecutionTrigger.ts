import {IExecution} from './IExecution';

export interface IExecutionTrigger {
  user: string;
  type: string;
  parentExecution?: IExecution;
}
