import {PipeTransform, Type} from '@angular/core';

import {TIME_PIPES} from './time';

export const CORE_PIPES: Type<PipeTransform>[] = [
  ...TIME_PIPES
];
