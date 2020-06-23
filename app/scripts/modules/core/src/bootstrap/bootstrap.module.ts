import { IModule, module } from 'angular';

import { OVERRIDE_REGISTRY } from 'core/overrideRegistry/override.registry';

import { SPINNAKER_CONTAINER_COMPONENT } from './spinnakerContainer.component';
import { CUSTOM_BANNER } from 'core/header/customBanner/customBanner.component';

export const APPLICATION_BOOTSTRAP_MODULE = 'spinnaker.core.applicationBootstrap';
export const bootstrapModule = module(APPLICATION_BOOTSTRAP_MODULE, [
  OVERRIDE_REGISTRY,
  CUSTOM_BANNER,
  SPINNAKER_CONTAINER_COMPONENT,
]) as IModule;
