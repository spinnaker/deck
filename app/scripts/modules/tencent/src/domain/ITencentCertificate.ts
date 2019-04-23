import { ICertificate } from '@spinnaker/core';

export interface ITencentCertificate extends ICertificate {
  arn: string;
  uploadDate: number;
}
