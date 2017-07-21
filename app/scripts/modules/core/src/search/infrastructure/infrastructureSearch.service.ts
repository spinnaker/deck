import { module, IDeferred, IPromise, IQService } from 'angular';
import { Observable, Subject } from 'rxjs';

import { UrlBuilderService, URL_BUILDER_SERVICE } from 'core/navigation/urlBuilder.service';
import { ProviderServiceDelegate, PROVIDER_SERVICE_DELEGATE } from 'core/cloudProvider/providerService.delegate';
import { getFallbackResults, ISearchResult, ISearchResults, SearchService, SEARCH_SERVICE } from '../search.service';
import {
  IResultDisplayFormatter,
  ISearchResultFormatter,
  searchResultFormatterRegistry
} from '../searchResult/searchResultFormatter.registry';
import { externalSearchRegistry } from '../externalSearch.registry';

export interface ISearchResultSet {
  id: string,
  category: string,
  icon: string,
  iconClass: string,
  order: number,
  results: ISearchResult[]
}

export interface IProviderResultFormatter {
  [category: string]: IResultDisplayFormatter,
}

export class InfrastructureSearcher {

  private deferred: IDeferred<ISearchResultSet[]>;
  public querySubject: Subject<string> = new Subject<string>();

  constructor(private $q: IQService, private providerServiceDelegate: ProviderServiceDelegate, searchService: SearchService, urlBuilderService: UrlBuilderService) {
    this.querySubject.switchMap(
      (query: string) => {
        if (!query || query.trim() === '') {
          return Observable.of(getFallbackResults());
        }
        return Observable.zip(
          searchService.search({q: query, type: searchResultFormatterRegistry.getSearchCategories()}),
          externalSearchRegistry.search(query),
          (s1, s2) => {
            s1.results = s1.results.concat(s2);
            return s1;
          }
        )
      })
      .subscribe((result: ISearchResults<ISearchResult>) => {
        const tmp: {[type: string]: ISearchResult[]} = result.results.reduce((categories: { [type: string]: ISearchResult[] }, entry: ISearchResult) => {
          this.formatResult(entry.type, entry).then((name) => entry.displayName = name);
          entry.href = urlBuilderService.buildFromMetadata(entry);
          if (!categories[entry.type]) {
            categories[entry.type] = [];
          }
          categories[entry.type].push(entry);
          return categories;
        }, {});
        this.deferred.resolve(Object.keys(tmp)
          .filter(c => searchResultFormatterRegistry.get(c))
          .map(category => {
            const config = searchResultFormatterRegistry.get(category);
            return {
              id: category,
              category: config.displayName,
              icon: config.icon,
              iconClass: config.iconClass,
              order: config.order,
              hideIfEmpty: config.hideIfEmpty,
              results: tmp[category]
            };
          })
        );
      });
  }

  public query(q: string): IPromise<ISearchResultSet[]> {
    this.deferred = this.$q.defer();
    this.querySubject.next(q);
    return this.deferred.promise;
  }

  public getCategoryConfig(category: string): ISearchResultFormatter {
    return searchResultFormatterRegistry.get(category);
  }

  public formatRouteResult(category: string, entry: ISearchResult): IPromise<string> {
    return this.formatResult(category, entry, true);
  }

  private formatResult(category: string, entry: ISearchResult, fromRoute = false): IPromise<string> {
    const config = searchResultFormatterRegistry.get(category);
    if (!config) {
      return this.$q.when('');
    }
    let formatter = config.displayFormatter;

    if (this.providerServiceDelegate.hasDelegate(entry.provider, 'search.resultFormatter')) {
      const providerFormatter: IProviderResultFormatter = this.providerServiceDelegate.getDelegate<IProviderResultFormatter>(entry.provider, 'search.resultFormatter');
      if (providerFormatter[category]) {
        formatter = providerFormatter[category];
      }
    }
    return formatter(entry, fromRoute);
  }
}

export class InfrastructureSearchService {
  constructor(private $q: IQService, private providerServiceDelegate: any, private searchService: SearchService, private urlBuilderService: UrlBuilderService) {}

  public getSearcher(): InfrastructureSearcher {
    return new InfrastructureSearcher(this.$q, this.providerServiceDelegate, this.searchService, this.urlBuilderService);
  }
}

export const INFRASTRUCTURE_SEARCH_SERVICE = 'spinnaker.infrastructure.search.service';
module(INFRASTRUCTURE_SEARCH_SERVICE, [
  SEARCH_SERVICE,
  URL_BUILDER_SERVICE,
  PROVIDER_SERVICE_DELEGATE,
]).service('infrastructureSearchService', InfrastructureSearchService);
