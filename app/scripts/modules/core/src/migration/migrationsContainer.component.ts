import { withErrorBoundary } from 'core/presentation/SpinErrorBoundary';
import { module } from 'angular';
import { react2angular } from 'react2angular';
import { MigrationsContainer } from './MigrationsContainer';

export const CORE_MIGRATIONS_CONTAINER_COMPONENT = 'spinnaker.core.migrations.container';
export const name = CORE_MIGRATIONS_CONTAINER_COMPONENT;

module(name, []).component(
  'migrationsContainer',
  react2angular(withErrorBoundary(MigrationsContainer, 'migrationsContainer'), ['app']),
);
