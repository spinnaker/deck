import { module } from 'angular';
import { react2angular } from 'react2angular';

import { INSIGHT_FILTER_STATE_MODEL } from './insightFilterState.model';
import { InsightLayout } from './InsightLayout';

export const INSIGHT_LAYOUT_COMPONENT = 'spinnaker.core.insight.insightLayout.component';
module(INSIGHT_LAYOUT_COMPONENT, [INSIGHT_FILTER_STATE_MODEL]).component(
  'insightLayout',
  react2angular(InsightLayout, ['app']),
);
