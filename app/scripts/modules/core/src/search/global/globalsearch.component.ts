import { module } from 'angular';
import { react2angular } from 'react2angular';

import { GlobalSearch } from './GlobalSearch';

export const GLOBAL_SEARCH = 'spinnaker.core.search.global.component';
module(GLOBAL_SEARCH, [])
    .component('globalSearch', react2angular(GlobalSearch));
