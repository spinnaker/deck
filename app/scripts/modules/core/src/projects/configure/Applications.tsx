import * as React from 'react';
import { FormikErrors } from 'formik';
import { IWizardPageProps, wizardPage } from '@spinnaker/core';
import VirtualizedSelect from 'react-virtualized-select';

import './Applications.css';

interface IApplications {
  applications: string[];
}

interface IApplicationsState {
  applications: string[];
}

export interface IApplicationsProps extends IWizardPageProps<IApplications> {
  applications?: string[];
  allApplications: string[];
  onChange: Function;
}

class ApplicationsImpl extends React.Component<IApplicationsProps, IApplicationsState> {
  public static LABEL = 'Applications';

  constructor(props: IApplicationsProps) {
    super(props);
    this.state = {
      applications: this.props.applications || [],
    };
  }

  private addApplication = async (app: string) => {
    await this.setState({
      applications: this.state.applications.concat(app),
    });
    this.props.formik.setFieldValue('applications', this.state.applications);
    this.props.onChange(this.state.applications);
  };

  private removeApplication = async (app: string) => {
    await this.setState({
      applications: this.state.applications.filter(application => application !== app),
    });
    this.props.formik.setFieldValue('applications', this.state.applications);
  };

  public validate(_values: IApplications) {
    return {} as FormikErrors<IApplications>;
  }

  public render() {
    const { applications } = this.state;
    return (
      <div className="Applications vertical center">
        <ul className="nostyle">
          {applications &&
            applications.map((app: string) => (
              <li key={app} style={{ width: '100%' }} className="horizontal">
                <div className="body-small zombie-label flex-1 sp-padding-xs-yaxis sp-padding-s-xaxis sp-margin-xs-yaxis">
                  {app}
                </div>{' '}
                <button
                  onClick={() => {
                    this.removeApplication(app);
                  }}
                  className="nostyle"
                >
                  <i className="fas fa-trash-alt" />
                </button>
              </li>
            ))}
        </ul>
        <VirtualizedSelect
          options={this.props.allApplications.map(app => ({
            value: app,
            label: app,
          }))}
          onChange={(item: { value: string; label: string }) => {
            this.addApplication(item.value);
          }}
          className="body-small"
        />
      </div>
    );
  }
}

export const Applications = wizardPage(ApplicationsImpl);
