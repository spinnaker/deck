import * as React from 'react';
import { FormikFormField, TextInput } from 'core/presentation';
import { INotificationTypeCustomConfig } from 'core/domain';

export class HipchatNotificationType extends React.Component<INotificationTypeCustomConfig> {
  public render() {
    const { botName, fieldName } = this.props;
    return (
      <>
        <div className="form-group row">
          {!!botName && (
            <div className="col-sm-9 col-sm-offset-3">
              <strong>Please note:</strong> You need to invite the
              <strong> {botName} </strong> bot to <strong>private</strong> rooms to receive HipChat notifications
              <br />
            </div>
          )}
          <FormikFormField
            name={fieldName ? `${fieldName}.address` : 'address'}
            label="HipChat Room"
            input={props => (
              <TextInput inputClassName={'form-control input-sm'} {...props} placeholder="enter a HipChat room" />
            )}
            required={true}
          />
        </div>
      </>
    );
  }
}
