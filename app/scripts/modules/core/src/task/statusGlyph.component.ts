import { module } from 'angular';
import { react2angular } from 'react2angular';

import { StatusGlyph } from './StatusGlyph';

export const STATUS_GLYPH_COMPONENT = 'spinnaker.core.task.statusGlyph.component';
module(STATUS_GLYPH_COMPONENT, [])
  .component('statusGlyph', react2angular(StatusGlyph, ['item']));
