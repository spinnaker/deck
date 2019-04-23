import * as React from 'react';
import { FormikProps } from 'formik';
import { IWizardPageComponent } from '@spinnaker/core';

import { SecurityGroupSelector } from '../securityGroups/SecurityGroupSelector';
import { ITencentServerGroupCommand } from '../../serverGroupConfiguration.service';
import { ServerGroupSecurityGroupsRemoved } from '../securityGroups/ServerGroupSecurityGroupsRemoved';

export interface IServerGroupSecurityGroupsProps {
  formik: FormikProps<ITencentServerGroupCommand>;
}

export class ServerGroupSecurityGroups extends React.Component<IServerGroupSecurityGroupsProps>
  implements IWizardPageComponent<ITencentServerGroupCommand> {
  public validate(values: ITencentServerGroupCommand) {
    const errors = {} as any;

    if (values.viewState.dirty.securityGroups) {
      errors.securityGroups = 'You must acknowledge removed security groups.';
    }
    if (!values.securityGroups || !values.securityGroups.length) {
      errors.securityGroups = 'Firewalls required.';
    }
    return errors;
  }

  private onChange = (securityGroups: string[]) => {
    this.props.formik.setFieldValue('securityGroups', securityGroups);
  };

  private acknowledgeRemovedGroups = () => {
    const { viewState } = this.props.formik.values;
    viewState.dirty.securityGroups = null;
    this.props.formik.setFieldValue('viewState', viewState);
  };

  public render() {
    const { values } = this.props.formik;

    return (
      <div className="container-fluid form-horizontal">
        <ServerGroupSecurityGroupsRemoved command={values} onClear={this.acknowledgeRemovedGroups} />
        <SecurityGroupSelector
          command={values}
          availableGroups={values.backingData.filtered.securityGroups}
          groupsToEdit={values.securityGroups}
          onChange={this.onChange}
        />
      </div>
    );
  }
}
