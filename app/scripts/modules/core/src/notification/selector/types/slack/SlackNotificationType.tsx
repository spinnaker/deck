import React from 'react';

import { INotificationTypeCustomConfig } from 'core/domain';
import { FormikFormField, TextInput } from 'core/presentation';

export class SlackNotificationType extends React.Component<INotificationTypeCustomConfig> {
  public render() {
    const { fieldName } = this.props;
    return (
      <>
        <FormikFormField
          label="Slack Channel"
          name={fieldName ? `${fieldName}.address` : 'address'}
          input={(props) => (
            <TextInput inputClassName={'form-control input-sm'} {...props} placeholder="enter a Slack channel" />
          )}
          required={true}
        />
      </>
    );
  }
}
