import * as React from 'react';
import { FormikFormField, TextInput, Validators } from 'core/presentation';
import { INotificationTypeCustomConfig } from 'core/domain';

export class EmailNotificationType extends React.Component<INotificationTypeCustomConfig> {
  public render() {
    const { fieldName } = this.props;
    return (
      <>
        <div className="sp-margin-m-bottom">
          <FormikFormField
            name={fieldName ? `${fieldName}.address` : 'address'}
            label="Email Address"
            validate={Validators.emailValue('Please enter a valid email address')}
            input={props => <TextInput inputClassName={'form-control input-sm'} {...props} />}
            required={true}
          />
        </div>
        <div className="sp-margin-m-bottom">
          <FormikFormField
            name={fieldName ? `${fieldName}.cc` : 'cc'}
            label="CC Address"
            validate={Validators.emailValue('Please enter a valid email address')}
            input={props => <TextInput inputClassName={'form-control input-sm'} {...props} />}
          />
        </div>
      </>
    );
  }
}
