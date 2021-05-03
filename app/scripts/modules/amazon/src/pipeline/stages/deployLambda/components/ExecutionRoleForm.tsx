import React from 'react';

import { FormikFormField, IFormInputProps, TextInput } from '@spinnaker/core';

export function ExecutionRoleForm() {
  return (
    <FormikFormField
      name="role"
      label="Role ARN"
      input={(props: IFormInputProps) => <TextInput {...props} placeholder="Enter role ARN" name="role" />}
    />
  );
}
