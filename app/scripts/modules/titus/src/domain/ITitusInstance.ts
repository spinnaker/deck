import { IAmazonInstance } from '@spinnaker/amazon';

export interface ITitusInstance extends IAmazonInstance {
  instanceType?: string;
  jobId?: string;
}
