import {module} from 'angular';

import {RENDER_IF_FEATURE} from './renderIfFeature.component';
import {TIME_FILTERS} from 'core/utils/filters';

export * from './pipes';

export const CORE_UTILS_MODULE = 'spinnaker.utils';
module('spinnaker.utils', [
  require('./jQuery.js'),
  require('./appendTransform.js'),
  require('./clipboard/copyToClipboard.directive.js'),
  TIME_FILTERS,
  require('./infiniteScroll.directive.js'),
  RENDER_IF_FEATURE,
]);
