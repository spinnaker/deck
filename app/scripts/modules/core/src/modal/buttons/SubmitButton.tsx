import * as React from 'react';
import { Button } from 'react-bootstrap';

import { NgReact } from 'core/reactShims';

export interface ISubmitButtonProps {
  onClick: () => void;
  isDisabled?: boolean;
  isNew?: boolean;
  submitting: boolean;
  label: string;
}

export class SubmitButton extends React.Component<ISubmitButtonProps> {
  public render() {
    const { ButtonBusyIndicator } = NgReact;
    return (
      <Button
        className="btn btn-primary"
        disabled={this.props.isDisabled}
        onClick={this.props.onClick}
      >
        { !this.props.submitting && (
          <i className="fa fa-check-circle-o"/>
        ) || (
          <ButtonBusyIndicator/>
        )}&nbsp;
        {this.props.label || (this.props.isNew ? 'Create' : 'Update')}
      </Button>
    );
  }
}
