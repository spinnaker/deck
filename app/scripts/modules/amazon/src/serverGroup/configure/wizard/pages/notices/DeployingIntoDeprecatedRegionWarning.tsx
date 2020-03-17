import React from 'react';

import { IAmazonServerGroupCommand } from '../../../serverGroupConfiguration.service';
import { FormikProps } from 'formik';

interface IDeployingIntoDeprecatedRegionWarningProps {
  formik: FormikProps<IAmazonServerGroupCommand>;
}

export default function DeployingIntoDeprecatedRegionWarning({ formik }: IDeployingIntoDeprecatedRegionWarningProps) {
  const { values } = formik;
  return values.regionIsDeprecated(values) ? (
    <div className="form-group row">
      <div className="col-md-12 error-message">
        <div className="alert alert-danger">
          You are deploying into a deprecated region within the {values.credentials} account!
        </div>
      </div>
    </div>
  ) : null;
}
