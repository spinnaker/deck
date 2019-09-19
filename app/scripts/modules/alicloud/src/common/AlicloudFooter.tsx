import * as React from 'react';
import { ModalFooter } from 'react-bootstrap';

import { AccountService, UserVerification, IAccountDetails } from '@spinnaker/core';

export interface IAlicloudModalFooterProps {
  account: string;
  isValid?: boolean;
  onCancel: () => void;
  onSubmit: () => void;
}

export interface IAlicloudModalFooterState {
  verified: boolean;
  requireVerification: boolean;
}

export class AlicloudFooter extends React.Component<IAlicloudModalFooterProps, IAlicloudModalFooterState> {
  public static defaultProps: Partial<IAlicloudModalFooterProps> = {
    isValid: true,
  };

  public state = { verified: false, requireVerification: false };

  public componentDidMount() {
    AccountService.accounts$
      .take(1)
      .map((accounts: IAccountDetails[]) => accounts.find(account => account.name === this.props.account))
      .subscribe((account: IAccountDetails) => {
        this.setState({ requireVerification: !!account && account.challengeDestructiveActions });
      });
  }

  private handleVerification = (verified: boolean) => {
    this.setState({ verified });
  };

  public render() {
    const { account, onCancel, onSubmit, isValid } = this.props;
    console.log(this.props);
    const { verified, requireVerification } = this.state;
    const handleSubmit = () => {
      this.props.onSubmit();
    };

    return (
      <ModalFooter>
        <form onSubmit={handleSubmit}>
          {requireVerification && <UserVerification expectedValue={account} onValidChange={this.handleVerification} />}
        </form>

        <button className="btn btn-default" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" onClick={onSubmit} disabled={!isValid}>
          Submit
        </button>
      </ModalFooter>
    );
  }
}
