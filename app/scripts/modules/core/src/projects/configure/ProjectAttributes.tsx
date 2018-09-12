import * as React from 'react';
import { FormikProps } from 'formik';

export interface IProjectAttributesProps extends FormikProps<any> {}

export interface IProjectAttributesState {}

export class ProjectAttributes extends React.Component<IProjectAttributesProps, IProjectAttributesState> {
  state: IProjectAttributesState = {};

  public render() {
    const { setFieldValue } = this.props;

    return (
      <div className="form-horizontal">
        <div className="modal-body">
          <div className="form-group">
            <div className="col-md-3 sm-label-right">
              <b>Project Name</b>
            </div>
            <div className="col-md-7">
              <input
                type="text"
                className="form-control input-sm"
                name="name"
                onChange={e => setFieldValue('name', e.target.value)}
                required
                ng-pattern="/^[^\\\^/^?^%^#]*$/"
                validate-unique="projectNames"
                validate-ignore-case="true"
              />
            </div>
          </div>
          <div className="form-group row slide-in" ng-if="configSubForm.name.$error.pattern">
            <div className="col-sm-9 col-sm-offset-3 error-message">
              <div>Project name cannot contain any of the following characters:</div>
              <code>/ \ ? % #</code>
            </div>
          </div>
          <div className="form-group row slide-in" ng-if="configSubForm.name.$error.validateUnique">
            <div className="col-sm-9 col-sm-offset-3 error-message">
              <span>There is already a project with that name.</span>
            </div>
          </div>
          <div className="form-group row">
            <div className="col-sm-3 sm-label-right">Owner Email</div>
            <div className="col-sm-7">
              <input
                type="email"
                name="email"
                ng-class="{'ng-invalid ng-dirty':command.emailErrorMsg.length > 0 }"
                className="form-control input-sm "
                ng-model="command.email"
                placeholder="Enter an email address"
                required
              />
            </div>
          </div>
          <div className="form-group row slide-in" ng-if="configSubForm.email.$dirty && configSubForm.email.$invalid">
            <div className="col-sm-9 col-sm-offset-3 error-message">
              <span>Please enter a valid email address</span>
            </div>
          </div>
          <div className="form-group" ng-if="!viewState.deleteProject && command.id" style={{ marginTop: 20 }}>
            <div className="col-sm-3 sm-label-right">
              <button className="btn btn-default btn-sm" ng-click="viewState.deleteProject = true">
                <span className="glyphicon glyphicon-trash" /> Delete Project
              </button>
            </div>
          </div>
          <div className="form-group well" ng-if="viewState.deleteProject">
            <div className="col-md-12">
              <p>
                Type the name of the project ({'{'}
                {'{'}command.name{'}'}
                {'}'}) below to continue.
              </p>
              <div className="form-group">
                <div className="col-md-8 col-md-offset-2">
                  <input
                    type="text"
                    autoFocus
                    ng-model="viewState.verifyProjectDelete"
                    className="form-control input-sm highlight-pristine"
                    ng-class="{'ng-invalid': viewState.verifyProjectDelete !== command.name}"
                  />
                </div>
              </div>
              <div className="form-group">
                <div className="col-md-8 col-md-offset-2">
                  <button className="btn btn-default" ng-click="viewState.deleteProject = false">
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary"
                    ng-disabled="viewState.verifyProjectDelete !== command.name"
                    ng-click="ctrl.deleteProject()"
                  >
                    <span className="glyphicon glyphicon-trash" /> Delete project
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
