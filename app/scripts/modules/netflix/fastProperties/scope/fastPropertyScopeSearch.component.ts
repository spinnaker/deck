import './fastPropetyScopeSearch.less';

import { CATEGORY_BUTTON_LIST_COMPONENT } from './categoryButtonList.component';

import {debounce, uniqWith, isEqual} from 'lodash';
import { module, IComponentController, IComponentOptions, IQService} from 'angular';
import {ACCOUNT_SERVICE, AccountService} from 'core/account/account.service';
import { FAST_PROPERTY_SCOPE_SEARCH_CATEGORY_SERVICE, FastPropertyScopeCategoryService } from './fastPropertyScopeSearchCategory.service';
import {Scope} from '../domain/scope.domain';
import values = require('lodash/values');
import {Application} from 'core/application/application.model';
import {ICluster} from 'core/domain/ICluster';
import {ServerGroup} from 'core/domain/serverGroup';
import {FAST_PROPERTY_READ_SERVICE} from '../fastProperty.read.service';

export class FastPropertyScopeSearchComponentController implements IComponentController {

  public query: string;
  public querying = false;
  public showSearchResults = false;
  public focussedResult: any;
  public selectedResult: any;
  public categories: any[];
  public scopeOptionsForDisplay: any;
  public env: string;
  public impactCount: string;
  public onScopeSelected: any;
  public applicationName: string;
  public regions: any;
  public applicationDictionary: any = {};
  public showNoImpactListForCategory: any = {};

  private search: any;

  static get $inject() {
    return [
      '$q',
      'infrastructureSearchService',
      'accountService',
      'fastPropertyScopeSearchCategoryService'
    ];
  }

  public $onChanges(changes: any) {
    if (!changes.env.isFirstChange()) {
      this.executeQuery();
    }
  }

  public $onInit() {
    this.accountService.getAllAccountDetailsForProvider('aws')
      .then((accounts: any) => {
        const regions = accounts.reduce((acc: any, account: any) => {
          account.regions.forEach((region: any) => acc.add(region.name));
          return acc;
        }, new Set());

        this.regions = Array
          .from(regions)
          .map((region) => {
            return {
              displayName: region,
              region: region
            };
          });

        this.fastPropertyScopeSearchCategoryService.regions = this.regions;
      })
      .then(() => {
        if (this.applicationName && this.applicationName !== 'spinnakerfp') {
          this.query = this.applicationName;
          this.executeQuery();
        }
      });
  }

  constructor(private $q: IQService,
              infrastructureSearchService: any,
              private accountService: AccountService,
              private fastPropertyScopeSearchCategoryService: FastPropertyScopeCategoryService) {
    this.search = infrastructureSearchService();
    this.executeQuery = debounce(this.executeQuery, 400);
  }

  public clearFilters() {
    this.query = '';
    this.showSearchResults = false;
  }

  /*
   * Select a category item from the list
   */
  public selectResult(category: string, selected: any) {
    this.selectedResult = selected;
    this.showSearchResults = false;
    this.scopeOptionsForDisplay = this.fastPropertyScopeSearchCategoryService.buildScopeList(this.categories, category, selected, this.env);
  }

  public displayResults() {
    this.showSearchResults = true;
  }

  public toggleNoInpactList(categoryName: string) {
    this.showNoImpactListForCategory[categoryName] = this.showNoImpactListForCategory[categoryName]
                                                    ? !this.showNoImpactListForCategory[categoryName]
                                                    : true;
  }

  /*
   * Query and build the category list
   */
  public dispatchQueryInput() {
    this.executeQuery();
  }

  private executeQuery() {
    this.querying = true;
    this.search
      .query(this.query)
      .then((data: any) => this.excludeUnnecessaryCategories(data))
      .then((data: any) => this.filterCategoriesByStartWithQuery(data))
      .then((data: any) => this.addGlobalCategory(data))
      .then((data: any) => this.addRegionCategory(data))
      .then((data: any) => this.fetchApplicationInfo(data))
      .then((data: any) => this.addStackCategory(data))
      .then((data: any) => this.createScopesForEachCategoryResult(data))
      .then((data: any) => this.doneQuerying(data));
  }

  /*
   * Filters
   */
  public noImpact(categoryScope: any) {
    return categoryScope.instanceCounts.up < 1;
  }

  private excludeUnnecessaryCategories(results: any[]) {
    return this.fastPropertyScopeSearchCategoryService.includeNeededCategories(results);
  }

  private filterCategoriesByStartWithQuery(categories: any[]): any {
    return categories.map((category: any) => {
      category.results = category.results.filter((r: any) => r.displayName.toLowerCase().startsWith(this.query.toLowerCase()));
      return category;
    });
  }

  public fetchApplicationInfo(categories: any[]): any {
    const listOfPromises: ng.IPromise<any>[] = [];

    categories.forEach((category) => {
      category.results.forEach((item: any) => {
        if (item.application && !this.applicationDictionary[item.application] ) {
          this.applicationDictionary[item.application] = {}; // this is for the if-check
          listOfPromises.push(
            this.fastPropertyScopeSearchCategoryService.getApplicationByName(item.application)
              .then((application: any) => {
                this.applicationDictionary[item.application] = application;
              })
          );
        }
      });
    });

    return this.$q.all(listOfPromises).then(() => {
      return categories;
    });
  }

  private addGlobalCategory(categories: any[]) {
    categories.unshift({ order: 90, category: 'Global', results: [{displayName: 'Global'}] });
    return categories;
  }

  private addRegionCategory(categories: any[]) {
    categories.unshift({order: 80, category: 'Regions', results: this.regions});
    return categories;
  }

  private addStackCategory(categories: any[]) {
    const applicationCategory = categories
      .find((cat: any) => cat.category === 'Applications');
    const applicationNames = applicationCategory ? applicationCategory.results.map((item: any) => item.application) : [];

    const appsClusters = values(this.applicationDictionary).reduce((acc: any[], app: Application): any[] => {
      if (applicationNames.includes(app.name)) {
        app.clusters.forEach((cluster: ICluster) => {
          cluster.serverGroups.forEach((serverGroup: ServerGroup) => {
            acc.push({
              region: serverGroup.region,
              application: app.name,
              cluster: serverGroup.cluster
            });
          });
        });
      }
      return uniqWith(acc, isEqual);
    }, []);

    categories.unshift({order: 79, category: 'Stack', results: appsClusters });

    return categories;
  }

  private createScopesForEachCategoryResult(categories: any[]) {
    return categories.map((category) => {
      category.scopes = category.results.reduce((acc: any[], result: any) => {
        this.fastPropertyScopeSearchCategoryService.buildScopeList(this.applicationDictionary, category.category, result, this.env)
          .forEach((scope: any) => acc.push(scope));
        return acc;
      }, []);
      return category;
    });
  }

  private doneQuerying(categories: any[]) {
      this.categories = categories;
      this.displayResults();
      this.querying = false;
  }

  public selectScope(scopeOption: Scope) {
    this.onScopeSelected({ scopeOption: scopeOption });
  }
}

class FastPropertyScopeSearchComponent implements IComponentOptions {
  public templateUrl: string = require('./fastPropertyScopeSearch.component.html');
  public controller: any = FastPropertyScopeSearchComponentController;
  public bindings: any = {
    onScopeSelected: '&',
    applicationName: '=',
    env: '@',
  };
}

export const FAST_PROPERTY_SCOPE_SEARCH_COMPONENT = 'spinnaker.netflix.fastproperty.scope.search.component';

module(FAST_PROPERTY_SCOPE_SEARCH_COMPONENT, [
  require('core/search/infrastructure/infrastructureSearch.service'),
  FAST_PROPERTY_READ_SERVICE,
  ACCOUNT_SERVICE,
  FAST_PROPERTY_SCOPE_SEARCH_CATEGORY_SERVICE,
  CATEGORY_BUTTON_LIST_COMPONENT,
])
  .component('fastPropertyScopeSearchComponent', new FastPropertyScopeSearchComponent());
