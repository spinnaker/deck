import * as React from 'react';

import { FormikFormField, IWizardPageComponent, TextInput } from '@spinnaker/core';
import { FormikProps, FormikErrors } from 'formik';
import { IAmazonFunctionUpsertCommand } from 'amazon/index';
import { IAmazonFunction } from 'amazon/domain';

export interface IExecutionRoleProps {
  formik: FormikProps<IAmazonFunctionUpsertCommand>;
  isNew?: boolean;
  functionDef: IAmazonFunction;
}

export interface IExecutionRoleState {
  some: '';
}

export class ExecutionRole extends React.Component<IExecutionRoleProps, IExecutionRoleState>
  implements IWizardPageComponent<IAmazonFunctionUpsertCommand> {
  constructor(props: IExecutionRoleProps) {
    super(props);
    this.state = {
      some: '',
    };
  }

  public validate(values: IAmazonFunctionUpsertCommand): FormikErrors<IAmazonFunctionUpsertCommand> {
    const errors = {} as any;

    if (values.role && !values.role.match(/^arn:aws:iam::\d{12}:role\/?\/[a-zA-Z_0-9+=,.@\-_/]+/)) {
      errors.role = 'Invalid role. Must match regular expression:  arn:aws:iam::d{12}:role/?[a-zA-Z_0-9+=,.@-_/]+ ';
    }
    return errors;
  }

  public render() {
    const { values } = this.props.formik;

    return (
      <div className="form-group">
        <div className="col-md-11">
          <div className="sp-margin-m-bottom">
            <FormikFormField
              name="role"
              label="Role ARN"
              fastField={false}
              input={props => (
                <TextInput
                  {...props}
                  type="text"
                  placeholder="Enter role ARN"
                  className="form-control input-sm no-spel"
                  name="role"
                  value={values.role}
                />
              )}
              required={true}
            />
          </div>
        </div>
      </div>
    );
  }
}
