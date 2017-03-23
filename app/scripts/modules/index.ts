import {PipeTransform, Type} from '@angular/core';

import {IDowngradeItem} from 'core/domain/IDowngradeItem';
import {CORE_MODULE_DOWNGRADES, CORE_COMPONENT_MODULE_DOWNGRADES, CORE_DIRECTIVE_UPGRADES} from './core';
import {CORE_PIPES} from './core/utils/pipes';
import {NETFLIX_COMPONENT_MODULE_DOWNGRADES} from './netflix';

export const SPINNAKER_DOWNGRADES: IDowngradeItem[] = [
  ...CORE_MODULE_DOWNGRADES
];

export const SPINNAKER_COMPONENT_DOWNGRADES: IDowngradeItem[] = [
  ...CORE_COMPONENT_MODULE_DOWNGRADES,
  ...NETFLIX_COMPONENT_MODULE_DOWNGRADES
];

export const SPINNAKER_DIRECTIVE_UPGRADES: Type<any>[] = [
  ...CORE_DIRECTIVE_UPGRADES
];

export const SPINNAKER_PIPES: Type<PipeTransform>[] = [
  ...CORE_PIPES
];
