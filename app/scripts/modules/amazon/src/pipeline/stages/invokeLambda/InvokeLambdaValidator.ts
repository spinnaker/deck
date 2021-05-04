import { FormValidator, IContextualValidator, IStage } from '@spinnaker/core';
import { awsArnValidator } from 'amazon/aws.validators';

export const validate: IContextualValidator = (stageConfig: IStage) => {
  const validator = new FormValidator(stageConfig);

  validator
    .field('triggerArns', 'Trigger ARNs')
    .optional()
    .withValidators((value: any) => {
      const tmp: any[] = value.map((arn: string) => {
        return awsArnValidator(arn, arn);
      });
      const ret: boolean = tmp.every((el) => el === undefined);
      return ret
        ? undefined
        : 'Invalid ARN. Event ARN must match regular expression: /^arn:aws[a-zA-Z-]?:[a-zA-Z_0-9.-]+:./';
    });

  return validator.validateForm();
};
