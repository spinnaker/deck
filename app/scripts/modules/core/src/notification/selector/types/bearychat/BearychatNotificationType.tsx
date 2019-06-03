import * as React from 'react';
import { FormikFormField, TextInput } from 'core/presentation';
import { INotificationTypeCustomConfig } from 'core/domain';

export class BearychatNoficationType extends React.Component<INotificationTypeCustomConfig> {
  private validate = (value: string) => {
    let errorMessage: string;
    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value)) {
      errorMessage = 'Please enter a valid email address';
    }
    return errorMessage;
  };

  public render() {
    const { fieldName } = this.props;
    return (
      <div className="form-group row">
        <FormikFormField
          name={fieldName ? `${fieldName}.address` : 'address'}
          label="Email Address"
          validate={this.validate}
          input={props => <TextInput inputClassName={'form-control input-sm'} {...props} />}
          required={true}
        />
      </div>
    );
  }
}
