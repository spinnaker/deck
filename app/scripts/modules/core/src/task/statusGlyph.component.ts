import { module } from 'angular';
import { withErrorBoundary } from 'core/presentation/SpinErrorBoundary';
import { react2angular } from 'react2angular';

import { StatusGlyph } from './StatusGlyph';

export const STATUS_GLYPH_COMPONENT = 'spinnaker.core.task.statusGlyph.component';
module(STATUS_GLYPH_COMPONENT, []).component(
  'statusGlyph',
  react2angular(withErrorBoundary(StatusGlyph, 'statusGlyph'), ['item']),
);
