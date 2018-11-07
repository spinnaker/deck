import * as React from 'react';

import { IValidationMessageProps, ValidationMessage } from 'core/validation';

import { IFieldLayoutProps } from '../interface';

import './StandardFieldLayout.css';

export class StandardFieldLayout extends React.Component<IFieldLayoutProps> {
  public render() {
    const { label, help, input, actions, touched, validationMessage, validationStatus } = this.props;

    const showLabel = !!label || !!help;

    const renderMessage = (message: React.ReactNode, type: IValidationMessageProps['type']) =>
      typeof message === 'string' ? <ValidationMessage type={type} message={message} /> : message;

    const isErrorOrWarning = validationStatus === 'error' || validationStatus === 'warning';
    const validation = isErrorOrWarning && !touched ? null : renderMessage(validationMessage, validationStatus);

    return (
      <div className="StandardFieldLayout flex-container-h baseline margin-between-lg">
        {showLabel && (
          <div className="sm-label-right">
            {label} {help}
          </div>
        )}

        <div className="flex-grow">
          <div className="flex-container-v">
            <div className="flex-container-h baseline margin-between-lg">
              {input} {actions}
            </div>

            {validation}
          </div>
        </div>
      </div>
    );
  }
}
