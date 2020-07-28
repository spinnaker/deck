import React from 'react';
import { FormikFormField, TextInput, Validators } from 'core/presentation';
import { INotificationTypeCustomConfig } from 'core/domain';

export class BearychatNotificationType extends React.Component<INotificationTypeCustomConfig> {
  public render() {
    const { fieldName } = this.props;
    return (
      <FormikFormField
        label="Email Address"
        name={fieldName ? `${fieldName}.address` : 'address'}
        validate={Validators.emailValue('Please enter a valid email address')}
        input={props => <TextInput inputClassName={'form-control input-sm'} {...props} />}
        required={true}
      />
    );
  }
}
