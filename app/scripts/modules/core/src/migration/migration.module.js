'use strict';

import { module } from 'angular';

import { CORE_MIGRATIONS_CONTAINER_COMPONENT } from './migrationsContainer.component';

export const CORE_MIGRATION_MODULE = 'spinnaker.core.migration';
export const name = CORE_MIGRATION_MODULE; // for backwards compatibility
module(CORE_MIGRATION_MODULE, [CORE_MIGRATIONS_CONTAINER_COMPONENT]);
