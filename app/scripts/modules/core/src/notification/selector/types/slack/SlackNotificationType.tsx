import * as React from 'react';
import { FormikFormField, TextInput } from 'core/presentation';
import { INotificationTypeCustomConfig } from 'core/domain';

export class SlackNotificationType extends React.Component<INotificationTypeCustomConfig> {
  public render() {
    const { botName, fieldName } = this.props;
    return (
      <>
        <div className="sp-margin-m-bottom">
          <FormikFormField
            name={fieldName ? `${fieldName}.address` : 'address'}
            label="Slack Channel"
            input={props => (
              <TextInput inputClassName={'form-control input-sm'} {...props} placeholder="enter a Slack channel" />
            )}
            required={true}
          />
          {!!botName && (
            <div className="row">
              <div className="col-sm-9 col-sm-offset-3">
                <strong>Note:</strong> You will need to invite the
                <strong> {botName} </strong>
                bot to this channel to receive Slack notifications
                <br />
              </div>
            </div>
          )}
        </div>
      </>
    );
  }
}
