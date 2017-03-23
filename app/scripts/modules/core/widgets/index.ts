import {Type} from '@angular/core';
import {module} from 'angular';

import {SYSTEM_TIMEZONE_COMPONENT} from './systemTimezone.component';
import {UI_SELECT_COMPONENT, UiSelectComponentDirective} from './uiSelect.component';

export const WIDGET_DIRECTIVE_UPGRADES: Type<any>[] = [
  UiSelectComponentDirective
];

export const CORE_WIDGETS_MODULE = 'spinnaker.core.widgets';
module(CORE_WIDGETS_MODULE, [
  require('./accountNamespaceClusterSelector.component'),
  require('./accountRegionClusterSelector.component'),
  require('./scopeClusterSelector.directive'),
  require('./notifier/notifier.component.js'),
  require('./spelText/spelText.decorator'),
  require('./spelText/numberInput.component'),
  SYSTEM_TIMEZONE_COMPONENT,
  UI_SELECT_COMPONENT
]);
