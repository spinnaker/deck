import * as React from 'react';
import { FormikProps } from 'formik';
import { IWizardPageProps, wizardPage } from '@spinnaker/core';
import Select, { Option } from 'react-select';

interface IApplications {
  applications: string[];
}

interface IApplicationsState {
  applications: string[];
}

export interface IApplicationsProps extends FormikProps<IApplications> {
  addApplication: Function;
  removeApplication: Function;
}

class ApplicationsImpl extends React.Component<
  IApplicationsProps & IWizardPageProps & FormikProps<IApplications>,
  IApplicationsState
> {
  public static LABEL = 'Applications';

  constructor(props: IApplicationsProps & IWizardPageProps & FormikProps<IApplications>) {
    super(props);
    this.state = {
      applications: [],
    };
  }

  private addApplication = (app: string) => {
    this.setState({
      applications: this.state.applications.push(app),
    });
    this.props.addApplication(app);
  };

  private removeApplication = (app: string) => {
    this.setState({
      applications: this.state.applications.filter(application => application !== app),
    });
    this.props.removeApplication(app);
  };

  public render() {
    const { applications } = this.state;

    return (
      <div>
        <ul className="nostyle">
          {applications &&
            applications.map((app: string) => (
              <li>
                <span>{app}</span>
                <button
                  onClick={() => {
                    this.removeApplication(app);
                  }}
                >
                  <i className="fa fa-trash" />
                </button>
              </li>
            ))}
        </ul>
        <Select
          options={[
            { value: 'test2', label: 'test2' },
            { value: 'test2', label: 'test2' },
            { value: 'test3', label: 'test3' },
          ]}
          onChange={(evt: React.ChangeEvent<HTMLInputElement>) => {
            this.addApplication('test');
          }}
        />
      </div>
    );
  }
}

export const Applications = wizardPage<IApplicationsProps>(ApplicationsImpl);
