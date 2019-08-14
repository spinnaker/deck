import * as React from 'react';
import { FormikFormField, TextInput, Validators } from 'core/presentation';
import { INotificationTypeCustomConfig } from 'core/domain';

export class GithubNotificationType extends React.Component<INotificationTypeCustomConfig> {
  public render() {
    const { fieldName } = this.props;
    return (
      <>
        <div className="sp-margin-m-bottom">
          <div className={'form-group'}>
            <label className={'col-md-4 sm-label-right'}>Github Repository</label>
            <div className="col-md-6">
              <FormikFormField
                name={fieldName ? `${fieldName}.repo` : 'repo'}
                input={props => <TextInput inputClassName={'form-control input-sm'} {...props} />}
                required={true}
              />
            </div>
          </div>
        </div>
        <div className="sp-margin-m-bottom">
          <div className={'form-group'}>
            <label className={'col-md-4 sm-label-right'}>Commit SHA</label>
            <div className="col-md-6">
              <FormikFormField
                name={fieldName ? `${fieldName}.commit` : 'commit'}
                validate={Validators.emailValue('Please enter a valid email address')}
                input={props => <TextInput inputClassName={'form-control input-sm'} {...props} />}
              />
            </div>
          </div>
        </div>
      </>
    );
  }
}
