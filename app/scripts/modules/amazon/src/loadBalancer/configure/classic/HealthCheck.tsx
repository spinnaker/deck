import * as React from 'react';
import { BindAll } from 'lodash-decorators';
import { Field, FormikProps } from 'formik';

import { IWizardPageProps, wizardPage } from '@spinnaker/core';

import { IAmazonClassicLoadBalancerUpsertCommand } from 'amazon/domain';

@BindAll()
class HealthCheckImpl extends React.Component<IWizardPageProps & FormikProps<IAmazonClassicLoadBalancerUpsertCommand>> {
  public static LABEL = 'Health Check';

  public validate(): { [key: string]: string } {
    return {};
  }

  public requiresHealthCheckPath(): boolean {
    return this.props.values.healthCheckProtocol && this.props.values.healthCheckProtocol.indexOf('HTTP') === 0;
  }

  private healthCheckPathChanged(event: React.ChangeEvent<HTMLInputElement>) {
    const { value } = event.target;
    this.props.setFieldValue('healthCheckPath', value && value.indexOf('/') !== 0 ? `/${value}` : value);
  }

  public render() {
    return (
      <div className="container-fluid form-horizontal">
        <div className="col-md-4 sm-label-right">Ping</div>
        <div className="col-md-8">
          <table className="table table-condensed packed">
            <thead>
              <tr>
                <th style={{ width: '35%' }}>Protocol</th>
                <th style={{ width: '30%' }}>Port</th>
                <th>{this.requiresHealthCheckPath() && <span>Path</span>}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <Field
                    className="form-control input-sm"
                    component="select"
                    name="healthCheckProtocol"
                    required={true}
                  >
                    <option>HTTP</option>
                    <option>HTTPS</option>
                    <option>SSL</option>
                    <option>TCP</option>
                  </Field>
                </td>
                <td>
                  <Field
                    className="form-control input-sm"
                    type="number"
                    name="healthCheckPort"
                    required={true}
                    min="0"
                  />
                </td>
                <td>
                  {this.requiresHealthCheckPath() && (
                    <Field
                      className="form-control input-sm no-spel"
                      type="text"
                      onChange={this.healthCheckPathChanged}
                      name="healthCheckPath"
                      required={true}
                    />
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

export const HealthCheck = wizardPage(HealthCheckImpl);
