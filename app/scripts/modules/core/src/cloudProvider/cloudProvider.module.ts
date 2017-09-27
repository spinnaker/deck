import { module } from 'angular';

import { CLOUD_PROVIDER_LOGO } from './cloudProviderLogo.component';
import { VERSIONED_CLOUD_PROVIDER_REGISTRY } from './versionedCloudProvider.registry';

export const CLOUD_PROVIDER_MODULE = 'spinnaker.core.cloudProvider';
module(CLOUD_PROVIDER_MODULE, [
  CLOUD_PROVIDER_LOGO,
  VERSIONED_CLOUD_PROVIDER_REGISTRY,
  require('./cloudProviderLabel.directive'),
  require('./providerSelection/providerSelector.directive'),
]);
