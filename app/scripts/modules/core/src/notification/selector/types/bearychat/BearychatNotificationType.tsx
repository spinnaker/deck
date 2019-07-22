import * as React from 'react';
import { FormikFormField, TextInput, Validators } from 'core/presentation';
import { INotificationTypeCustomConfig } from 'core/domain';

export class BearychatNoficationType extends React.Component<INotificationTypeCustomConfig> {
  public render() {
    const { fieldName } = this.props;
    return (
      <div className="form-group row">
        <FormikFormField
          name={fieldName ? `${fieldName}.address` : 'address'}
          label="Email Address"
          validate={Validators.emailValue('Please enter a valid email address')}
          input={props => <TextInput inputClassName={'form-control input-sm'} {...props} />}
          required={true}
        />
      </div>
    );
  }
}
