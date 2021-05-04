import { FormValidator, IContextualValidator, IStage } from '@spinnaker/core';

export const validate: IContextualValidator = (stageConfig: IStage) => {
  const validator = new FormValidator(stageConfig);
  validator.field('account', 'Account Name').required();

  validator.field('region', 'Region').required();

  validator.field('functionName', 'Lambda Function Name').required();

  validator.field('version', 'Lambda Function Version').required();

  return validator.validateForm();
};
