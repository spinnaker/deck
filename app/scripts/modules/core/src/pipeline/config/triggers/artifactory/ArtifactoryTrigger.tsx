import React from 'react';

import { FormikFormField, ReactSelectInput, errorMessage, useLatestPromise } from 'core/presentation';

import { ArtifactoryReaderService } from './artifactoryReader.service';

export function ArtifactoryTrigger() {
  const fetchNames = useLatestPromise(() => ArtifactoryReaderService.getArtifactoryNames(), []);

  const fetchError = () =>
    errorMessage(`Error fetching artifactory names: ${fetchNames.error.data.status} ${fetchNames.error.data.error}`);
  const validationMessage = fetchNames.status === 'REJECTED' ? fetchError() : null;

  return (
    <FormikFormField
      name="artifactorySearchName"
      label="Artifactory Name"
      touched={true}
      validationMessage={validationMessage}
      input={(props) => (
        <ReactSelectInput
          {...props}
          isLoading={status === 'PENDING'}
          placeholder="Select Artifactory search name..."
          stringOptions={fetchNames.result}
          clearable={false}
        />
      )}
    />
  );
}
