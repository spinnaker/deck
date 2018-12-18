import * as React from 'react';
import { FieldArray, getIn } from 'formik';

import { FormikFormField, IWizardPageProps, TextInput } from '@spinnaker/core';

import { ICloudFoundryCreateServerGroupCommand } from 'cloudfoundry/serverGroup/configure/serverGroupConfigurationModel.cf';

export interface IBuildpacksProps extends IWizardPageProps<ICloudFoundryCreateServerGroupCommand> {}

export class Buildpacks extends React.Component<IBuildpacksProps> {
  public render() {
    return (
      <div>
        <div className="form-group">
          <div className="col-md-12">
            <b>Buildpacks</b>
            <FieldArray
              name="manifest.buildpacks"
              render={arrayHelpers => {
                const serverGroupCommand: ICloudFoundryCreateServerGroupCommand = arrayHelpers.form.values;
                const buildpacks: string[] = getIn(serverGroupCommand, 'manifest.buildpacks')
                  ? getIn(serverGroupCommand, 'manifest.buildpacks')
                  : [];

                return (
                  <table className="table table-condensed packed metadata">
                    <tbody>
                      {buildpacks.map((_, index: number) => (
                        <tr key={index}>
                          <td>
                            <div className="sp-margin-m-bottom">
                              <FormikFormField
                                name={`manifest.buildpacks[${index}]`}
                                input={props => <TextInput {...props} />}
                                required={true}
                              />
                            </div>
                          </td>
                          <td>
                            <a className="btn btn-link sm-label" onClick={() => arrayHelpers.remove(index)}>
                              <span className="glyphicon glyphicon-trash" />
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={2}>
                          <button type="button" className="add-new col-md-12" onClick={() => arrayHelpers.push('')}>
                            <span className="glyphicon glyphicon-plus-sign" /> Add New Buildpack
                          </button>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                );
              }}
            />
          </div>
        </div>
      </div>
    );
  }
}
