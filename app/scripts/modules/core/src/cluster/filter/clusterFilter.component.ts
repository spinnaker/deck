import {compact, uniq, map} from 'lodash';
import {IScope, module} from 'angular';

import {CLUSTER_FILTER_SERVICE, ClusterFilterService} from 'core/cluster/filter/clusterFilter.service';
import {Application} from 'core/application/application.model';
import { CLUSTER_FILTER_MODEL, ClusterFilterModel } from './clusterFilter.model';
import { Subscription } from 'rxjs';
import { IFilterTag } from 'core/filterModel/FilterTags';
export const CLUSTER_FILTER = 'spinnaker.core.cluster.filter.component';

const ngmodule = module(CLUSTER_FILTER, [
  require('./collapsibleFilterSection.directive'),
  CLUSTER_FILTER_SERVICE,
  CLUSTER_FILTER_MODEL,
  require('core/filterModel/dependentFilter/dependentFilter.service'),
  require('./clusterDependentFilterHelper.service'),
]);

class ClusterFilterCtrl {
  public accountHeadings: string[];
  public app: Application;
  public availabilityZoneHeadings: string[];
  public categoryHeadings: string[];
  public instanceTypeHeadings: string[];
  public providerTypeHeadings: string[];
  public regionHeadings: string[];
  public sortFilter: any;
  public stackHeadings: string[];
  public tags: IFilterTag[];
  private groupsUpdatedSubscription: Subscription;
  private locationChangeUnsubscribe: () => void;

  constructor(public $scope: IScope,
              public clusterFilterService: ClusterFilterService,
              public clusterFilterModel: ClusterFilterModel,
              public $rootScope: IScope,
              public clusterDependentFilterHelper: any,
              public dependentFilterService: any,
  ) {
    'ngInject';
  }

  public $onInit(): void {
    const { $scope, $rootScope, clusterFilterModel, clusterFilterService, app } = this;
    const filterModel = clusterFilterModel.asFilterModel;

    this.sortFilter = filterModel.sortFilter;
    this.tags = filterModel.tags;
    this.groupsUpdatedSubscription = clusterFilterService.groupsUpdatedStream.subscribe(() => this.tags = filterModel.tags);

    if (app.serverGroups.loaded) {
      this.initialize();
    }

    app.serverGroups.onRefresh($scope, () => this.initialize());
    this.locationChangeUnsubscribe = $rootScope.$on('$locationChangeSuccess', () => {
      filterModel.activate();
      clusterFilterService.updateClusterGroups(app);
    });

    $scope.$on('$destroy', () => {
      this.groupsUpdatedSubscription.unsubscribe();
      this.locationChangeUnsubscribe();
    });
  }

  public updateClusterGroups(applyParamsToUrl = true): void {
    const { dependentFilterService, clusterFilterModel, clusterDependentFilterHelper, clusterFilterService, app } = this;

    const { providerType, instanceType, account, availabilityZone, region } = dependentFilterService.digestDependentFilters({
      sortFilter: clusterFilterModel.asFilterModel.sortFilter,
      dependencyOrder: ['providerType', 'account', 'region', 'availabilityZone', 'instanceType'],
      pool: clusterDependentFilterHelper.poolBuilder(app.serverGroups.data)
    });

    this.providerTypeHeadings = providerType;
    this.accountHeadings = account;
    this.availabilityZoneHeadings = availabilityZone;
    this.regionHeadings = region;
    this.instanceTypeHeadings = instanceType;
    if (applyParamsToUrl) {
      clusterFilterModel.asFilterModel.applyParamsToUrl();
    }
    clusterFilterService.updateClusterGroups(app);
  }

  private getHeadingsForOption(option: string): string[] {
    return compact(uniq(map(this.app.serverGroups.data, option) as string[])).sort();
  }

  public clearFilters(): void {
    const {clusterFilterService, app} = this;
    clusterFilterService.clearFilters();
    clusterFilterService.updateClusterGroups(app);
    this.updateClusterGroups(false);
  }

  public initialize(): void {
    this.stackHeadings = ['(none)'].concat(this.getHeadingsForOption('stack'));
    this.categoryHeadings = this.getHeadingsForOption('category');
    this.updateClusterGroups();
  }
}

ngmodule.component('clusterFilter', {
  templateUrl: require('./clusterFilter.component.html'),
  controller: ClusterFilterCtrl,
  bindings: {
    app: '<',
  },
});
