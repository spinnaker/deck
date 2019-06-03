import * as React from 'react';
import { FormikFormField, TextInput } from 'core/presentation';
import { INotificationTypeCustomConfig } from 'core/domain';

export class PubsubNotificationType extends React.Component<INotificationTypeCustomConfig> {
  public render() {
    const { fieldName } = this.props;
    return (
      <div className="form-group row">
        <FormikFormField
          name={fieldName ? `${fieldName}.publisherName` : 'publisherName'}
          label="Publisher Name"
          input={props => (
            <TextInput
              inputClassName={'form-control input-sm'}
              {...props}
              placeholder="enter a pubsub publisher name"
            />
          )}
          required={true}
        />
      </div>
    );
  }
}
