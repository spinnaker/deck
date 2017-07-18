import { IController, IComponentOptions, module } from 'angular';

import {
  CACHE_INITIALIZER_SERVICE,
  CacheInitializerService,
  INFRASTRUCTURE_CACHE_SERVICE,
  InfrastructureCacheService
} from '@spinnaker/core';

class GceCacheRefreshCtrl implements IController {
  public capitalizedKey: string;
  public depluralizedKey: string;
  public renderCompact: boolean;
  public refreshing = false;
  public tooltipTemplate = require('./cacheRefreshTooltip.html');
  private onRefresh: Function;
  private cacheKey: string;
  private cacheKeyAlias: string;

  constructor(private cacheInitializer: CacheInitializerService,
              private infrastructureCaches: InfrastructureCacheService) {
    'ngInject';
  }

  public $onInit(): void {
    const cacheKeyAlias = this.cacheKeyAlias || this.cacheKey;
    this.capitalizedKey = cacheKeyAlias[0].toUpperCase() + cacheKeyAlias.substring(1);
    this.depluralizedKey = cacheKeyAlias.substring(0, cacheKeyAlias.length - 1);
  }

  public getRefreshTime(): number {
    return this.infrastructureCaches.get(this.cacheKey).getStats().ageMax;
  }

  public refresh(): void {
    this.refreshing = true;
    this.cacheInitializer.refreshCache(this.cacheKey)
      .then(() => this.onRefresh())
      .then(() => { this.refreshing = false; });
  };
}

class GceCacheRefresh implements IComponentOptions {
  public bindings: any = {
    onRefresh: '&',
    cacheKey: '@',
    cacheKeyAlias: '@',
    renderCompact: '<'
  };
  public controller: any = GceCacheRefreshCtrl;
  public templateUrl = require('./cacheRefresh.component.html');
}

export const GCE_CACHE_REFRESH = 'spinnaker.gce.cacheRefresh.component';
module(GCE_CACHE_REFRESH, [
  CACHE_INITIALIZER_SERVICE,
  INFRASTRUCTURE_CACHE_SERVICE
]).component('gceCacheRefresh', new GceCacheRefresh());

