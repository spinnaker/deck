import * as React from 'react';
import { FormikProps, Field } from 'formik';
import { IWizardPageProps, wizardPage, IProjectConfig } from '@spinnaker/core';

interface IProjectAttributes {
  name?: string;
  email?: string;
  projectNameForDeletion?: string;
}

interface IProjectAttributesState {
  name?: string;
  email?: string;
  showProjectDeleteForm: boolean;
}

export interface IProjectAttributesProps extends FormikProps<IProjectAttributes> {
  onDelete?: Function;
  existingProjectNames?: string[];
  configuration?: {
    name?: string;
    email?: string;
  };
}

class ProjectAttributesImpl extends React.Component<
  IProjectAttributesProps & IWizardPageProps & FormikProps<IProjectAttributes>,
  IProjectAttributesState
> {
  public static LABEL = 'Project Attributes';

  constructor(props: IProjectAttributesProps & IWizardPageProps & FormikProps<IProjectAttributes>) {
    super(props);
    this.state = {
      name: null,
      email: null,
      showProjectDeleteForm: false,
    };
  }

  private isValidName = (name: string) => {
    const namePattern = /^[^\\\^/^?^%^#]*$/;
    return name.match(namePattern);
  };

  private isValidEmail = (email: string) => {
    const emailPattern = /^(.+)\@(.+).([A-Za-z]{2,6})/;
    return email.match(emailPattern);
  };

  public validate(values: IProjectAttributes): { [key: string]: string } {
    const errors: { [key: string]: string } = {};
    const { existingProjectNames } = this.props;

    if (values.name && !this.isValidName(values.name)) {
      errors.name = 'Project name cannot contain any of the following characters:  / % #';
    } else if (values.name && existingProjectNames.includes(values.name)) {
      errors.name = 'Project name already exists.';
    }

    if (values.email && !this.isValidEmail(values.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (values.projectNameForDeletion && values.projectNameForDeletion !== this.props.configuration.name) {
      errors.projectNameForDeletion = 'Please enter the correct project name.';
    }

    return errors;
  }

  public render() {
    const { errors, setFieldValue, values, onDelete } = this.props;

    return (
      <div className="form-horizontal">
        <div className="modal-body">
          <div className="form-group">
            <div className="col-md-3 sm-label-right">
              <b>Project Name</b>
            </div>
            <div className="col-md-7 sp-form">
              <div className="field">
                <Field
                  type="text"
                  name="name"
                  value={this.props.configuration.name && this.props.configuration.name}
                  className={`form-control input-sm ${errors.name && 'error'}`}
                  required={true}
                  placeholder="Project Name"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFieldValue('name', e.target.value)}
                />
                {errors.name && <div className="error sp-message">{errors.name}</div>}
              </div>
            </div>
          </div>

          <div className="form-group">
            <div className="col-md-3 sm-label-right">
              <b>Owner Email</b>
            </div>

            <div className="col-md-7 sp-form">
              <div className="field">
                <Field
                  type="email"
                  name="email"
                  value={this.props.configuration.email && this.props.configuration.email}
                  className={`form-control input-sm ${errors.email && 'error'}`}
                  placeholder="Enter an email address"
                  required={true}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFieldValue('email', e.target.value)}
                />
                {errors.email && <div className="error sp-message">Please enter a valid email address.</div>}
              </div>
            </div>
          </div>
        </div>

        <div className="sp-margin-l-xaxis">
          {this.state.showProjectDeleteForm ? (
            <div className="form-group well" ng-if="viewState.deleteProject">
              <div className="col-md-12">
                <p>{`Type the name of the project (${values.name}) below to continue.`}</p>
                <div className="form-group">
                  <Field
                    type="text"
                    name="projectNameForDeletion"
                    className={`form-control input-sm highlight-pristine ${errors.email && 'error'}`}
                    placeholder="Project Name"
                    required={true}
                  />
                  {errors.projectNameForDeletion && (
                    <div className="error sp-message">{errors.projectNameForDeletion}</div>
                  )}
                </div>
                <div className="form-group">
                  <div className="sp-group-margin-xs-xaxis">
                    <button className="passive" ng-click="viewState.deleteProject = false">
                      Cancel
                    </button>
                    {this.props.configuration.name && (
                      <button
                        className="primary"
                        disabled={
                          !values.projectNameForDeletion ||
                          values.projectNameForDeletion !== this.props.configuration.name
                        }
                        onClick={() => onDelete()}
                      >
                        <span className="glyphicon glyphicon-trash" /> Delete project
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <button className="btn btn-default btn-sm" onClick={() => this.setState({ showProjectDeleteForm: true })}>
              <span className="glyphicon glyphicon-trash" /> Delete Project
            </button>
          )}
        </div>
      </div>
    );
  }
}

export const ProjectAttributes = wizardPage<IProjectAttributesProps>(ProjectAttributesImpl);
