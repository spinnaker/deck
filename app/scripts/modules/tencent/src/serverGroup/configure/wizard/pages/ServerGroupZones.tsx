import * as React from 'react';
import { FormikProps } from 'formik';
import { IWizardPageComponent } from '@spinnaker/core';

import { ITencentServerGroupCommand } from '../../serverGroupConfiguration.service';
import { AvailabilityZoneSelector } from '../../../AvailabilityZoneSelector';

export interface IServerGroupZonesProps {
  formik: FormikProps<ITencentServerGroupCommand>;
}

export class ServerGroupZones extends React.Component<IServerGroupZonesProps>
  implements IWizardPageComponent<ITencentServerGroupCommand> {
  public validate(values: ITencentServerGroupCommand) {
    const errors = {} as any;

    if (!values.availabilityZones || values.availabilityZones.length === 0) {
      errors.availabilityZones = 'You must select at least one availability zone.';
    }
    return errors;
  }

  private handleAvailabilityZonesChanged = (zones: string[]): void => {
    const { values, setFieldValue } = this.props.formik;
    values.usePreferredZonesChanged(values);
    setFieldValue('availabilityZones', zones);
  };

  public render() {
    const { values } = this.props.formik;
    return (
      <div className="container-fluid form-horizontal">
        <AvailabilityZoneSelector
          credentials={values.credentials}
          region={values.region}
          onChange={this.handleAvailabilityZonesChanged}
          selectedZones={values.availabilityZones}
          allZones={values.backingData.filtered.availabilityZones}
          usePreferredZones={values.viewState.usePreferredZones}
        />
        <div className="form-group">
          <div className="col-md-3 sm-label-right">
            <b>AZ Rebalance</b>
          </div>
          <div className="col-md-7 checkbox">
            <label>Keep instances evenly distributed across zones</label>
          </div>
        </div>
      </div>
    );
  }
}
