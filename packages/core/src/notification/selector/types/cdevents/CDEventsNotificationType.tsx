import React from 'react';

import type { INotificationTypeCustomConfig } from '../../../../domain';
import { FormikFormField, TextInput } from '../../../../presentation';

export class CDEventsNotificationType extends React.Component<INotificationTypeCustomConfig> {
  public render() {
    const { fieldName } = this.props;
    return (
      <>
        <FormikFormField
          label="Events Broker URL"
          name={fieldName ? `${fieldName}.address` : 'address'}
          input={(props) => (
            <TextInput
              inputClassName={'form-control input-sm'}
              {...props}
              placeholder="URL starts with https://events-broker-address/default/events-broker/"
            />
          )}
          required={true}
        />
        <FormikFormField
          label="CDEvents Type"
          name={fieldName ? `${fieldName}.cdEventsType` : 'cdEventsType'}
          input={(props) => (
            <TextInput
              inputClassName={'form-control input-sm'}
              {...props}
              placeholder="CDEvents Type starts with dev.cdevents.<subject>.<predicate>"
            />
          )}
          required={true}
        />
      </>
    );
  }
}
