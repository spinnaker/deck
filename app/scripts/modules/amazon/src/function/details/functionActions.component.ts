import { module } from 'angular';
import { react2angular } from 'react2angular';

import { FunctionActions } from './FunctionActions';

export const FUNCTION_ACTIONS = 'spinnaker.amazon.function.details.functionActions.component';
module(FUNCTION_ACTIONS, []).component(
  'functionActions',
  react2angular(FunctionActions, ['app', 'functionDef', 'functionFromParams']),
);
