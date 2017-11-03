import { IPromise } from 'angular';
import { $q, $log } from 'ngimport';

import { urlBuilderRegistry } from 'core/navigation/urlBuilder.registry';
import { IUrlBuilder } from 'core/navigation/urlBuilder.service';
import { searchResultTypeRegistry } from './searchResult/searchResultFormatter.registry';
import { ISearchResult } from './search.service';
import { ISearchResultType } from './searchResult/searchResultFormatter.registry';

/**
 * External search registry entries add a section to the infrastructure search
 */
export interface IExternalSearchConfig {

  /**
   * Provides the display text of the search entry. Can include HTML
   */
  searchResultType: ISearchResultType;

  /**
   * Method to fetch search results
   * @param query
   */
  search: (query: string) => IPromise<ISearchResult[]>;

  /**
   * Class to build the URL for search results
   */
  urlBuilder: IUrlBuilder
}

export class ExternalSearchRegistry {
  private registry: {[key: string]: IExternalSearchConfig} = {};

  public register(searchConfig: IExternalSearchConfig) {
    const type = searchConfig.searchResultType;
    searchResultTypeRegistry.register(type);
    urlBuilderRegistry.register(type.id, searchConfig.urlBuilder);
    this.registry[type.id] = searchConfig;
  }

  public search(query: string): IPromise<ISearchResult[]> {
    return $q.all(Object.keys(this.registry).map(k => this.registry[k].search(query)))
      .then((searchResults: ISearchResult[][]) => [].concat.apply([], searchResults))
      .catch((e) => {
        $log.warn('External search error:', e);
        return [];
      });
  }
}

export const externalSearchRegistry = new ExternalSearchRegistry();
