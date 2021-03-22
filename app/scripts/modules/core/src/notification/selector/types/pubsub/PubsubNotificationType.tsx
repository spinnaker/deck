import React from 'react';

import { INotificationTypeCustomConfig } from 'core/domain';
import { FormikFormField, TextInput } from 'core/presentation';

export class PubsubNotificationType extends React.Component<INotificationTypeCustomConfig> {
  public render() {
    const { fieldName } = this.props;
    return (
      <FormikFormField
        label="Publisher Name"
        name={fieldName ? `${fieldName}.publisherName` : 'publisherName'}
        input={(props) => (
          <TextInput inputClassName={'form-control input-sm'} {...props} placeholder="enter a pubsub publisher name" />
        )}
        required={true}
      />
    );
  }
}
