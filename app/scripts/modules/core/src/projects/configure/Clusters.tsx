import * as React from 'react';
import { FormikProps } from 'formik';
import { IWizardPageProps, wizardPage } from '@spinnaker/core';
import Select from 'react-select';
import { NgReact } from 'core/reactShims';
import { Field } from 'formik';

import { AccountService, IAccountDetails } from '@spinnaker/core';
import { TextField } from 'core/presentation';

import { IProjectCluster } from 'domain/IProject';

import './Clusters.css';

interface IClustersState {
  clusterEntries: IProjectCluster[];
  showNewRow: boolean;
  accounts: IAccountDetails[];
  showAppTextbox: boolean[];
}

export interface IClustersProps extends FormikProps<{}> {
  onChange: Function;
  selectedClusterEntries: IProjectCluster[];
}

class ClustersImpl extends React.Component<IClustersProps & IWizardPageProps & FormikProps<{}>, IClustersState> {
  public static LABEL = 'Clusters';

  constructor(props: IClustersProps & IWizardPageProps & FormikProps<{}>) {
    super(props);
    this.state = {
      clusterEntries: [],
      showNewRow: false,
      accounts: [],
      showAppTextbox: [],
    };
    this.loadAccounts();
  }

  private loadAccounts(): void {
    AccountService.listAccounts('aws').then(accounts => {
      this.setState({ accounts });
    });
  }

  private validate = (values: {}) => {
    return {};
  };

  private toggleAppField = (idx: number) => {
    const { showAppTextbox } = this.state;
    showAppTextbox[idx] = true;
    this.setState({
      showAppTextbox,
    });
  };

  private entryChanged = (type: string, value: string | string[], i: number) => {
    const { clusterEntries } = this.state;
    clusterEntries[i][type] = value;
    this.setState({
      clusterEntries,
    });
  };

  private createNewClusterEntry = () => {
    this.setState({
      clusterEntries: this.state.clusterEntries.concat({
        applications: [],
        account: null,
        stack: '*',
        detail: '*',
      }),
    });
  };

  public render() {
    const { HelpField } = NgReact;
    const { accounts } = this.state;
    const { clusterEntries, showAppTextbox } = this.state;

    return (
      <section className="Clusters vertical center">
        <table style={{ width: '100%' }}>
          <thead>
            <tr>
              <td>Application</td>
              <td className="accounts">Account</td>
              <td>
                Stack <HelpField id="project.cluster.stack" />
              </td>
              <td>
                Detail <HelpField id="project.cluster.detail" />
              </td>
            </tr>
          </thead>
          <tbody>
            {clusterEntries.map((entry, idx) => (
              <tr key={idx}>
                <td className="vertical">
                  <label className="sp-group-margin-s-xaxis">
                    <Field
                      name="applications"
                      type="checkbox"
                      onChange={() => this.toggleAppField(idx)}
                      checked={!entry.applications.length}
                    />
                    <span>All</span>
                  </label>
                  {!!(entry.applications.length || showAppTextbox[idx]) && (
                    <Field
                      name="applications"
                      value={entry.applications.join(',')}
                      onChange={(evt: React.ChangeEvent<HTMLInputElement>) =>
                        this.entryChanged('applications', evt.target.value.split(','), idx)
                      }
                    />
                  )}
                </td>
                <td>
                  <Select
                    value={entry.account}
                    options={accounts.map(account => ({
                      label: account.name,
                      value: account.accountId,
                    }))}
                    className="body-small"
                    onChange={(option: { value: string }) => this.entryChanged('account', option.value, idx)}
                  />
                </td>
                <td>
                  <Field
                    name="stack"
                    type="text"
                    value={entry.stack}
                    onChange={(evt: React.ChangeEvent<HTMLInputElement>) =>
                      this.entryChanged('stack', evt.target.value, idx)
                    }
                    className="sp-padding-xs-xaxis"
                  />
                </td>
                <td>
                  <Field
                    name="detail"
                    type="text"
                    value={entry.detail}
                    onChange={(evt: React.ChangeEvent<HTMLInputElement>) =>
                      this.entryChanged('detail', evt.target.value, idx)
                    }
                    className="sp-padding-xs-xaxis"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button className="zombie sp-margin-m" onClick={this.createNewClusterEntry}>
          <i className="fas fa-plus-circle" /> Add Cluster
        </button>
      </section>
    );
  }
}

export const Clusters = wizardPage<IClustersProps>(ClustersImpl);
