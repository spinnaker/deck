import * as React from 'react';

import { FormikFormField, IWizardPageComponent, HelpField, TextInput, ReactSelectInput } from '@spinnaker/core';
import { FormikProps, Field, FormikErrors } from 'formik';
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

  public validate(): FormikErrors<IAmazonFunctionUpsertCommand> {
    return {};
  }

  public render() {
    const { errors, values } = this.props.formik;

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
<<<<<<< HEAD
<<<<<<< HEAD
                  value={this.state.createNewRole ? roleOptions[0] : roleOptions[1]}
                  stringOptions={roleOptions}
=======
                  //   value={availableRoles[0]}
                  stringOptions={availableRoles}
>>>>>>> 5ae02b7cf... Added account dropdown
                  clearable={false}
                  onChange={this.handleRoleOption}
=======
                  type="text"
                  placeholder="Enter role ARN"
                  className="form-control input-sm no-spel"
                  name="role"
                  value={values.role}
>>>>>>> f86a932a7... Edit and delete functions
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
