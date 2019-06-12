import { module } from 'angular';
import { react2angular } from 'react2angular';

import { ExecutionWindowDayPicker } from './ExecutionWindowDayPicker';

export const EXECUTION_WINDOWS_DAY_PICKER = 'spinnaker.core.pipeline.stage.executionWindows.dayPicker';
module(EXECUTION_WINDOWS_DAY_PICKER, []).component(
  'executionWindowDayPicker',
  react2angular(ExecutionWindowDayPicker, ['days', 'onChange']),
);
