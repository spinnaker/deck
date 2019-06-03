import * as React from 'react';
import { FormikFormField, TextInput } from 'core/presentation';
import { INotificationTypeCustomConfig } from 'core/domain';

export class EmailNotificationType extends React.Component<INotificationTypeCustomConfig> {
  private validateEmail = (value: string): string => {
    let errorMessage: string;
    if (value && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value)) {
      errorMessage = 'Please enter a valid email address';
    }
    return errorMessage;
  };

  private validateCC = (value: string): string => {
    let errorMessage: string;
    if (value) {
      errorMessage = this.validateEmail(value);
    }
    return errorMessage;
  };

  public render() {
    const { fieldName } = this.props;
    return (
      <>
        <div className="form-group row">
          <FormikFormField
            name={fieldName ? `${fieldName}.address` : 'address'}
            label="Email Address"
            validate={this.validateEmail}
            input={props => <TextInput inputClassName={'form-control input-sm'} {...props} />}
            required={true}
          />
        </div>
        <div className="form-group row">
          <FormikFormField
            name={fieldName ? `${fieldName}.cc` : 'cc'}
            label="CC Address"
            validate={this.validateCC}
            input={props => <TextInput inputClassName={'form-control input-sm'} {...props} />}
          />
        </div>
      </>
    );
  }
}
