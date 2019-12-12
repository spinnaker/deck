'use strict';

import { RENDER_IF_FEATURE } from './renderIfFeature.component';
import { COPY_TO_CLIPBOARD_COMPONENT } from './clipboard/copyToClipboard.component';
import { TIME_FORMATTERS } from './timeFormatters';
import { SELECT_ON_DOUBLE_CLICK_DIRECTIVE } from 'core/utils/selectOnDblClick.directive';
import { UIB_MODAL_REJECTIONS } from './uibModalRejections';
import { CORE_UTILS_INFINITESCROLL_DIRECTIVE } from './infiniteScroll.directive';
import { CORE_UTILS_WAYPOINTS_WAYPOINT_DIRECTIVE } from './waypoints/waypoint.directive';
import { CORE_UTILS_WAYPOINTS_WAYPOINTCONTAINER_DIRECTIVE } from './waypoints/waypointContainer.directive';

import { module } from 'angular';

export const CORE_UTILS_UTILS_MODULE = 'spinnaker.utils';
export const name = CORE_UTILS_UTILS_MODULE; // for backwards compatibility
module(CORE_UTILS_UTILS_MODULE, [
  COPY_TO_CLIPBOARD_COMPONENT,
  TIME_FORMATTERS,
  SELECT_ON_DOUBLE_CLICK_DIRECTIVE,
  CORE_UTILS_INFINITESCROLL_DIRECTIVE,
  RENDER_IF_FEATURE,
  UIB_MODAL_REJECTIONS,
  CORE_UTILS_WAYPOINTS_WAYPOINT_DIRECTIVE,
  CORE_UTILS_WAYPOINTS_WAYPOINTCONTAINER_DIRECTIVE,
]);
