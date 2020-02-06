import React from 'react';
import { FormikProps } from 'formik';
import { IWizardPageComponent } from '@spinnaker/core';

import { IAmazonServerGroupCommand } from '../../serverGroupConfiguration.service';
import { AvailabilityZoneSelector } from '../../../AvailabilityZoneSelector';

export interface IServerGroupZonesProps {
  formik: FormikProps<IAmazonServerGroupCommand>;
}

export class ServerGroupZones extends React.Component<IServerGroupZonesProps>
  implements IWizardPageComponent<IAmazonServerGroupCommand> {
  public validate(values: IAmazonServerGroupCommand) {
    const errors = {} as any;

    if (!values.availabilityZones || values.availabilityZones.length === 0) {
      errors.availabilityZones = 'You must select at least one availability zone.';
    }
    return errors;
  }

  private handleAvailabilityZonesChanged = (zones: string[]): void => {
    this.props.formik.setFieldValue('availabilityZones', zones);
  };

  private handlePreferredZonesSelected = (): void => {
    const { values, setFieldValue } = this.props.formik;
    const preferredZones = values.backingData.preferredZones[values.credentials]?.[values.region]?.slice() || [];

    setFieldValue('availabilityZones', preferredZones);
  };

  private rebalanceToggled = () => {
    const { values, setFieldValue } = this.props.formik;
    values.toggleSuspendedProcess(values, 'AZRebalance');
    setFieldValue('suspendedProcesses', values.suspendedProcesses);
    this.setState({});
  };

  public render() {
    const { values } = this.props.formik;
    const currentAvailabilityZones = values.availabilityZones;
    const preferredZones = values.backingData.preferredZones[values.credentials]?.[values.region] || [];
    const isUsingPreferredZones = currentAvailabilityZones.sort().join() === preferredZones.sort().join();
    return (
      <div className="container-fluid form-horizontal">
        <AvailabilityZoneSelector
          credentials={values.credentials}
          region={values.region}
          onChange={this.handleAvailabilityZonesChanged}
          onPreferredZonesSelect={isUsingPreferredZones ? undefined : this.handlePreferredZonesSelected}
          selectedZones={values.availabilityZones}
          allZones={values.backingData.filtered.availabilityZones}
        />
        <div className="form-group">
          <div className="col-md-3 sm-label-right">
            <b>AZ Rebalance</b>
          </div>
          <div className="col-md-7 checkbox">
            <label>
              <input
                type="checkbox"
                onChange={this.rebalanceToggled}
                checked={!values.processIsSuspended(values, 'AZRebalance')}
              />
              Keep instances evenly distributed across zones
            </label>
          </div>
        </div>
      </div>
    );
  }
}
