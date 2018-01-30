import { module } from 'angular';
import { react2angular } from 'react2angular';
import { SearchResult } from './SearchResult';

export const SEARCH_RESULT_COMPONENT = 'spinnaker.core.search.infrastructure.searchResult.component';
module(SEARCH_RESULT_COMPONENT, []).component('searchResult', react2angular(SearchResult, ['displayName', 'account']));
