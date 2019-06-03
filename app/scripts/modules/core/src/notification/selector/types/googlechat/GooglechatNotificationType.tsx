import * as React from 'react';
import { FormikFormField, TextInput } from 'core/presentation';
import { INotificationTypeCustomConfig } from 'core/domain';

export class GooglechatNotificationType extends React.Component<INotificationTypeCustomConfig> {
  public render() {
    const { fieldName } = this.props;
    return (
      <>
        <div className="form-group row">
          <FormikFormField
            name={fieldName ? `${fieldName}.address` : 'address'}
            label="Chat Webhook URL"
            input={props => (
              <TextInput
                inputClassName={'form-control input-sm'}
                {...props}
                placeholder="URL starts with https://chat.googleapis.com/v1/spaces/"
              />
            )}
            required={true}
          />
        </div>
      </>
    );
  }
}
