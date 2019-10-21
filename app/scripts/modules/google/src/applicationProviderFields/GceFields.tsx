import * as React from 'react';

import { CheckboxInput, FormikFormField, HelpField } from '@spinnaker/core';

export function GceFields() {
  return (
    <FormikFormField
      label="GCE Settings"
      name="providerSettings.gce.associatePublicIpAddress"
      input={fieldProps => (
        <CheckboxInput
          {...fieldProps}
          text={
            <span>
              Associate Public IP Address <HelpField id="gce.serverGroup.associatePublicIpAddress.providerField" />
            </span>
          }
        />
      )}
    />
  );
}
