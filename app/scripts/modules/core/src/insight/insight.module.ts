import { module } from 'angular';

import './insight.less';

import { INSIGHT_FILTER_COMPONENT } from './insightFilter.component';
import { INSIGHT_FILTER_STATE_MODEL } from './insightFilterState.model';
import { INSIGHT_LAYOUT_COMPONENT } from './insightLayout.component';
import { INSIGHT_MENU_DIRECTIVE } from './insightmenu.directive';
import { PIN_EXECUTION_ID_MODEL } from './pinExecutionId.model';

export const INSIGHT_MODULE = 'spinnaker.core.insight.module';
module(INSIGHT_MODULE, [
  INSIGHT_FILTER_STATE_MODEL,
  INSIGHT_LAYOUT_COMPONENT,
  INSIGHT_FILTER_COMPONENT,
  INSIGHT_MENU_DIRECTIVE,
  PIN_EXECUTION_ID_MODEL,
]);
