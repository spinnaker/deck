import * as React from 'react';
import Select from 'react-select';
import { Field, FormikErrors } from 'formik';

import { NgReact } from 'core/reactShims';
import { AccountService, IAccountDetails } from 'core/account';
import { IWizardPageProps, wizardPage } from 'core/modal';
import { IProjectCluster } from 'core/domain';

import './Clusters.css';

interface IClustersState {
  clusterEntries: IProjectCluster[];
  showNewRow: boolean;
  accounts: IAccountDetails[];
}

export interface IClustersProps extends IWizardPageProps<any> {
  entries: IProjectCluster[];
  applications: string[];
}

class ClustersImpl extends React.Component<IClustersProps, IClustersState> {
  public static LABEL = 'Clusters';

  constructor(props: IClustersProps) {
    super(props);
    this.state = {
      clusterEntries: props.entries || [],
      showNewRow: false,
      accounts: [],
    };
    this.loadAccounts();
  }

  private loadAccounts(): void {
    AccountService.listAccounts('aws').then(accounts => {
      this.setState({ accounts });
    });
  }

  public validate = () => {
    return {} as FormikErrors<any>;
  };

  private entryChanged = (type: string, value: string, i: number, appIdx = -1) => {
    const { clusterEntries } = this.state;
    if (appIdx > -1 && type === 'applications') {
      clusterEntries[i].applications.splice(appIdx, 1, value);
    } else {
      clusterEntries[i][type] = value;
    }
    this.setState({
      clusterEntries,
    });
    this.props.formik.setFieldValue('clusters', clusterEntries);
  };

  private addNewApplication = (idx: number) => {
    const { clusterEntries } = this.state;
    if (clusterEntries[idx].applications === null) {
      clusterEntries[idx].applications = [''];
    } else {
      clusterEntries[idx].applications.push('');
    }
    this.setState({
      clusterEntries,
    });
  };

  private deleteApplication = (idx: number, appIdx: number) => {
    const { clusterEntries } = this.state;
    clusterEntries[idx].applications.splice(appIdx, 1);
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

  private deleteClusterEntry = (idx: number) => {
    const { clusterEntries } = this.state;
    clusterEntries.splice(idx, 1);
    this.setState({
      clusterEntries,
    });
    this.props.formik.setFieldValue('clusters', clusterEntries);
  };

  public render() {
    const { HelpField } = NgReact;
    const { accounts } = this.state;
    const { applications } = this.props;
    const { clusterEntries } = this.state;

    return (
      <section className="Clusters vertical center">
        <table style={{ width: '100%' }}>
          <thead>
            <tr>
              <td className="wide">Application</td>
              <td className="wide">Account</td>
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
                        onChange={() => this.addNewApplication(idx)}
                        checked={!entry.applications || !entry.applications.length}
                      />
                      <span>All</span>
                    </label>
                    {!!(entry.applications && entry.applications.length) && (
                      <div>
                        <ul className="nostyle sp-group-margin-xs-yaxis">
                          {entry.applications.map((app: string, appIdx: number) => (
                            <li key={`${app}~${appIdx}`} className="horizontal middle">
                              <Select
                                value={app}
                                options={applications.map(appName => ({
                                  label: appName,
                                  value: appName,
                                }))}
                                className="body-small flex-1"
                                onChange={(option: { value: string }) =>
                                  this.entryChanged('applications', option.value, idx, appIdx)
                                }
                              />
                              <div className="nostyle" onClick={() => this.deleteApplication(idx, appIdx)}>
                                <i className="fas fa-trash-alt" />
                              </div>
                            </li>
                          ))}
                        </ul>
                        <a className="button zombie sp-margin-xs-top" onClick={() => this.addNewApplication(idx)}>
                          <i className="fas fa-plus-circle" /> Add App
                        </a>
                      </div>
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
                    <div className="nostyle" onClick={() => this.deleteClusterEntry(idx)}>
                      <i className="fas fa-trash-alt" />
                    </div>
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

export const Clusters = wizardPage(ClustersImpl);
