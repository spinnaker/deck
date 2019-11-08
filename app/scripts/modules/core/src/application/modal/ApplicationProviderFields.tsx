import * as React from 'react';
import { isEmpty, isString } from 'lodash';

import { Application } from 'core/application';
import { CloudProviderRegistry } from 'core/cloudProvider';

export interface IApplicationProviderFieldsProps {
  application: Application;
  cloudProviders: string[];
}

export function ApplicationProviderFields(props: IApplicationProviderFieldsProps) {
  const componentPath = 'applicationProviderFields.component';
  const appCloudProviders = props.application.cloudProviders;
  const candidateProvidersToShow: string[] = isEmpty(appCloudProviders)
    ? props.cloudProviders
    : isString(appCloudProviders)
    ? appCloudProviders.split(',')
    : appCloudProviders;
  const components: any[] = (candidateProvidersToShow || [])
    .filter(provider => CloudProviderRegistry.hasValue(provider, componentPath))
    .map(provider => CloudProviderRegistry.getValue(provider, componentPath));

  const getRelevantProviderFieldsComponent = () => {
    return (
      <>
        {components.map((FieldComponent, index) => (
          <FieldComponent key={index} />
        ))}
      </>
    );
  };

  return getRelevantProviderFieldsComponent();
}
