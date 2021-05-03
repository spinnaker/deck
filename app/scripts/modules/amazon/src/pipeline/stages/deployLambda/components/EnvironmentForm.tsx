import React from 'react';

import { FormikFormField, HelpField, IFormInputProps, MapEditorInput, TextInput } from '@spinnaker/core';

export function ExecutionRoleForm() {
  return (
    <div>
      <FormikFormField
        name="envVariables"
        label="Env Variables"
        input={(props: IFormInputProps) => <MapEditorInput {...props} allowEmptyValues={true} addButtonLabel="Add" />}
      />
      <FormikFormField
        name="KMSKeyArn"
        label="Key ARN"
        help={<HelpField id="aws.function.kmsKeyArn" />}
        input={(props: IFormInputProps) => <TextInput {...props} />}
      />
    </div>
  );
}
