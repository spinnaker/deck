import * as React from 'react';

import { CheckboxInput, FormikFormField } from '@spinnaker/core';

export function AwsFields() {
  return (
    <FormikFormField
      label="AWS Settings"
      name="providerSettings.aws.useAmiBlockDeviceMappings"
      input={fieldProps => <CheckboxInput {...fieldProps} text="Prefer AMI Block Device Mappings" />}
    />
  );
}
