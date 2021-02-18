import { FormValidator, IContextualValidator, IStage } from 'core';

export const validate: IContextualValidator = (stage: IStage) => {
  const formValidator = new FormValidator(stage);
  formValidator.field('cluster', 'Cluster').required();
  formValidator.field('target', 'Target').required();
  formValidator.field('regions', 'Regions').required();
  formValidator.field('account', 'Account').required();
  return formValidator.validateForm();
};
