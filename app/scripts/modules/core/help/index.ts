import {Type} from '@angular/core';

import {HelpWidgetComponent} from './helpWidget.component';
import {HelpFieldComponentDirective} from './helpField.component';

export const HELP_DIRECTIVE_UPGRADES: Type<any>[] = [
  HelpFieldComponentDirective
];

export const HELP_COMPONENTS: Type<any>[] = [
  HelpWidgetComponent
];
