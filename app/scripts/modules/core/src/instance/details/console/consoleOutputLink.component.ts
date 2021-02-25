import { module } from 'angular';
import { react2angular } from 'react2angular';

import { withErrorBoundary } from 'core/presentation/SpinErrorBoundary';

import { ConsoleOutputLink } from './ConsoleOutputLink';

export const CORE_INSTANCE_DETAILS_CONSOLE_CONSOLEOUTPUTLINK_COMPONENT = 'spinnaker.core.instance.details.console.link';
export const name = CORE_INSTANCE_DETAILS_CONSOLE_CONSOLEOUTPUTLINK_COMPONENT;

module(name, []).component(
  'consoleOutputLink',
  react2angular(withErrorBoundary(ConsoleOutputLink, 'consoleOutputLink'), ['instance', 'text', 'usesMultiOutput']),
);
