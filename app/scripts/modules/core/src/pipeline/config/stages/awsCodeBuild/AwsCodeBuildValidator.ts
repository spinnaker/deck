import { FormValidator, IContextualValidator, IStage } from 'core';

export const validate: IContextualValidator = (stage: IStage) => {
  const formValidator = new FormValidator();
  formValidator.field('account', 'Account').required();
  formValidator
    .field('projectName', 'Project Name')
    .required()
    .withValidators(projectNameValidator);
  return formValidator.validate(stage);
};

export const projectNameValidator = (value: string, label: string) => {
  const projectName = value.match(/^[A-Za-z0-9][A-Za-z0-9-_]{1,149}$/);
  const err = projectName
    ? undefined
    : `Invalid project name.  ${label} must match regular expression: [A-Za-z0-9][A-Za-z0-9-_]{1,149}`;
  return err;
};
