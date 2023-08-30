import type { FormikProps } from 'formik';
import React from 'react';

import type { IAccount } from '@spinnaker/core';
import { AccountSelectInput, HelpField } from '@spinnaker/core';

import type { ICloudrunManifestCommandData } from '../manifestCommandBuilder.service';

export interface IManifestBasicSettingsProps {
  accounts: IAccount[];
  onAccountSelect: (account: string) => void;
  selectedAccount: string;
}

export function ManifestBasicSettings({ accounts, onAccountSelect, selectedAccount }: IManifestBasicSettingsProps) {
  return (
    <div className="form-horizontal">
      <div className="form-group">
        <div className="col-md-3 sm-label-right">
          Account <HelpField id="cloudrun.manifest.account" />
        </div>
        <div className="col-md-8">
          <AccountSelectInput
            value={selectedAccount}
            onChange={(evt: any) => onAccountSelect(evt.target.value)}
            readOnly={false}
            accounts={accounts}
            provider="cloudrun"
          />
        </div>
      </div>
    </div>
  );
}

export interface IWizardManifestBasicSettingsProps {
  formik: FormikProps<ICloudrunManifestCommandData>;
}

export class WizardManifestBasicSettings extends React.Component<IWizardManifestBasicSettingsProps> {
  private accountUpdated = (account: string): void => {
    const { formik } = this.props;
    formik.values.command.account = account;
    formik.setFieldValue('account', account);
  };

  public render() {
    const { formik } = this.props;
    return (
      <ManifestBasicSettings
        accounts={formik.values.metadata.backingData.accounts}
        onAccountSelect={this.accountUpdated}
        selectedAccount={formik.values.command.account}
      />
    );
  }
}
