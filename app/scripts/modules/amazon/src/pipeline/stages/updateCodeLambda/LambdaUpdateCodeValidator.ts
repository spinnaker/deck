import { FormValidator, IContextualValidator, IStage } from '@spinnaker/core';
import { s3BucketNameValidator } from 'amazon/aws.validators';

export const validate: IContextualValidator = (stageConfig: IStage) => {
  const validator = new FormValidator(stageConfig);

  validator.field('account', 'Account Name').required();

  validator.field('region', 'Region').required();

  validator.field('functionName', 'Lambda Function Name').required();

  validator.field('s3key', 'S3 Object Key').required();

  validator.field('s3bucket', 'S3 Bucket Name').required().withValidators(s3BucketNameValidator);

  return validator.validateForm();
};
