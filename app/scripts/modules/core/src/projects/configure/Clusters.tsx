import * as React from 'react';
import { FormikProps } from 'formik';
import { IWizardPageProps, wizardPage } from '@spinnaker/core';
import Select from 'react-select';
import { NgReact } from 'core/reactShims';
import { Field } from 'formik';

import { AccountService, IAccountDetails } from '@spinnaker/core';

import { IProjectCluster } from 'domain/IProject';

import './Clusters.css';

interface IClustersState {
  clusterEntries: IProjectCluster[];
  showNewRow: boolean;
  accounts: IAccountDetails[];
  showAppTextbox: boolean[];
}

export interface IClustersProps extends FormikProps<{}> {
  entries: IProjectCluster[];
  applications: string[];
}

class ClustersImpl extends React.Component<IClustersProps & IWizardPageProps & FormikProps<{}>, IClustersState> {
  public static LABEL = 'Clusters';

  constructor(props: IClustersProps & IWizardPageProps & FormikProps<{}>) {
    super(props);
    this.state = {
      clusterEntries: props.entries || [],
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

  public validate = (): { [key: string]: string } => {
    return {};
  };

  private toggleAppField = (idx: number) => {
    const { showAppTextbox } = this.state;
    showAppTextbox[idx] = true;
    this.setState({
      showAppTextbox,
    });
  };

  private entryChanged = (type: string, value: string, i: number, appIdx: number = -1) => {
    const { clusterEntries } = this.state;
    if (appIdx > -1 && type === 'applications') {
      clusterEntries[i].applications.splice(appIdx, 1, value);
    } else {
      clusterEntries[i][type] = value;
    }
    this.setState({
      clusterEntries,
    });
    this.props.setFieldValue('clusters', clusterEntries);
  };

  private addNewApplication = (idx: number) => {
    const { clusterEntries } = this.state;
    clusterEntries[idx].applications.push('');
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

  private deleteClusterEntry = (idx: number) => {
    const { clusterEntries } = this.state;
    clusterEntries.splice(idx, 1);
    this.setState({
      clusterEntries,
    });
    this.props.setFieldValue('clusters', clusterEntries);
  };

  public render() {
    const { HelpField } = NgReact;
    const { accounts } = this.state;
    const { applications } = this.props;
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
              <td />
            </tr>
          </thead>
          <tbody>
            {clusterEntries &&
              clusterEntries.map((entry, idx) => (
                <tr key={idx}>
                  <td className="vertical">
                    <label className="sp-group-margin-s-xaxis">
                      <Field
                        name="applications"
                        type="checkbox"
                        onChange={() => this.toggleAppField(idx)}
                        checked={!entry.applications || !entry.applications.length}
                      />
                      <span>All</span>
                    </label>
                    {!!((entry.applications && entry.applications.length) || showAppTextbox[idx]) && (
                      <section>
                        <ul className="nostyle">
                          {entry.applications.map((app, appIdx) => (
                            <Select
                              value={app}
                              options={applications.map(appName => ({
                                label: appName,
                                value: appName,
                              }))}
                              className="body-small"
                              onChange={(evt: React.ChangeEvent<HTMLInputElement>) =>
                                this.entryChanged('applications', evt.target.value, idx, appIdx)
                              }
                            />
                          ))}
                        </ul>
                        <a className="button zombie" onClick={() => this.addNewApplication(idx)}>
                          <i className="fas fa-plus-circle" /> Add App
                        </a>
                      </section>
                    )}
                  </td>
                  <td>
                    <Select
                      value={entry.account}
                      options={accounts.map(account => ({
                        label: account.name,
                        value: account.name,
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
                  <td>
                    <button className="nostyle" onClick={() => this.deleteClusterEntry(idx)}>
                      <i className="fas fa-trash-alt" />
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        <a className="button zombie sp-margin-m horizontal middle center" onClick={this.createNewClusterEntry}>
          <i className="fas fa-plus-circle" /> Add Cluster
        </a>
      </section>
    );
  }
}

export const Clusters = wizardPage<IClustersProps>(ClustersImpl);
