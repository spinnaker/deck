import React from 'react';

interface IDeployingIntoDeprecatedRegionWarningProps {
  credentials: string;
}

export function DeployingIntoDeprecatedRegionWarning({ credentials }: IDeployingIntoDeprecatedRegionWarningProps) {
  return (
    <div className="form-group row">
      <div className="col-md-12 error-message">
        <div className="alert alert-danger">
          You are deploying into a deprecated region within the {credentials} account!
        </div>
      </div>
    </div>
  );
}
