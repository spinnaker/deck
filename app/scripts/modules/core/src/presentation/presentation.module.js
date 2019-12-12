'use strict';

import { module } from 'angular';

import { AUTO_SCROLL_DIRECTIVE } from 'core/presentation/autoScroll/autoScroll.directive';
import { ANY_FIELD_FILTER } from './anyFieldFilter/anyField.filter';
import { PAGE_NAVIGATOR_COMPONENT } from './navigation/pageNavigator.component';
import { PAGE_SECTION_COMPONENT } from './navigation/pageSection.component';
import { REPLACE_FILTER } from './replace.filter';
import { ROBOT_TO_HUMAN_FILTER } from './robotToHumanFilter/robotToHuman.filter';
import { domPurifyOpenLinksInNewWindow } from './domPurifyOpenLinksInNewWindow';

import './flex-layout.less';
import './details.less';
import './main.less';
import './navPopover.less';
import { CORE_PRESENTATION_COLLAPSIBLESECTION_COLLAPSIBLESECTION_DIRECTIVE } from './collapsibleSection/collapsibleSection.directive';
import { CORE_PRESENTATION_ISVISIBLE_ISVISIBLE_DIRECTIVE } from './isVisible/isVisible.directive';
import { CORE_PRESENTATION_SORTTOGGLE_SORTTOGGLE_DIRECTIVE } from './sortToggle/sorttoggle.directive';
import { CORE_PRESENTATION_PERCENT_FILTER } from './percent.filter';

export const CORE_PRESENTATION_PRESENTATION_MODULE = 'spinnaker.core.presentation';
export const name = CORE_PRESENTATION_PRESENTATION_MODULE; // for backwards compatibility
module(CORE_PRESENTATION_PRESENTATION_MODULE, [
  ANY_FIELD_FILTER,
  AUTO_SCROLL_DIRECTIVE,
  PAGE_NAVIGATOR_COMPONENT,
  PAGE_SECTION_COMPONENT,
  CORE_PRESENTATION_COLLAPSIBLESECTION_COLLAPSIBLESECTION_DIRECTIVE,
  CORE_PRESENTATION_ISVISIBLE_ISVISIBLE_DIRECTIVE,
  ROBOT_TO_HUMAN_FILTER,
  CORE_PRESENTATION_SORTTOGGLE_SORTTOGGLE_DIRECTIVE,
  CORE_PRESENTATION_PERCENT_FILTER,
  REPLACE_FILTER,
]).run(domPurifyOpenLinksInNewWindow);
