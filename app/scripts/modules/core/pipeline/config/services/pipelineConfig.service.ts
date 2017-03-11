import {module} from 'angular';
import {sortBy, uniq} from 'lodash';

import {API_SERVICE, Api} from 'core/api/api.service';
import {AUTHENTICATION_SERVICE, AuthenticationService} from 'core/authentication/authentication.service';
import {VIEW_STATE_CACHE_SERVICE, ViewStateCacheService} from 'core/cache/viewStateCache.service';
import {ICache} from 'core/cache/deckCache.service';
import {IStage} from 'core/domain/IStage';
import {ITrigger} from 'core/domain/ITrigger';
import {IPipeline} from 'core/domain/IPipeline';

export class PipelineConfigService {

  private configViewStateCache: ICache;

  static get $inject() { return ['$q', 'API', 'authenticationService', 'viewStateCache', 'settings']; }

  public constructor(private $q: ng.IQService,
                     private API: Api,
                     private authenticationService: AuthenticationService,
                     viewStateCache: ViewStateCacheService,
                     private settings: any) {
    this.configViewStateCache = viewStateCache.createCache('pipelineConfig', { version: 1 });
  }

  private buildViewStateCacheKey(applicationName: string, pipelineName: string): string {
    return `${applicationName}:${pipelineName}`;
  }

  public getPipelinesForApplication(applicationName: string): ng.IPromise<IPipeline[]> {
    return this.API.one('applications').one(applicationName).all('pipelineConfigs').getList()
      .then((pipelines: IPipeline[]) => {
        pipelines.forEach(p => p.stages = p.stages || []);
        pipelines = pipelines.map(p => this.convertPipeline(p));
        return this.sortPipelines(pipelines);
      });
  }

  public getStrategiesForApplication(applicationName: string) {
    return this.API.one('applications').one(applicationName).all('strategyConfigs').getList()
      .then((pipelines: IPipeline[]) => {
        pipelines.forEach(p => p.stages = p.stages || []);
        return this.sortPipelines(pipelines);
      });
  }

  public getHistory(id: string, count = 20): ng.IPromise<IPipeline[]> {
    return this.API.one('pipelineConfigs', id).all('history').withParams({count: count}).getList();
  }

  public deletePipeline(applicationName: string, pipeline: IPipeline, pipelineName: string): ng.IPromise<void> {
    return this.API.one(pipeline.strategy ? 'strategies' : 'pipelines').one(applicationName, pipelineName).remove();
  }

  public savePipeline(pipeline: IPipeline): ng.IPromise<void> {
    delete pipeline.isNew;
    pipeline.stages.forEach(function(stage) {
      delete stage.isNew;
      if (!stage.name) {
        delete stage.name;
      }
    });
    if (this.settings.feature.convertCiToJenkinsOnPipelineSave == null || this.settings.feature.convertCiToJenkinsOnPipelineSave) {
      pipeline = this.convertPipeline(pipeline, 'ci', 'jenkins');
    }
    return this.API.one( pipeline.strategy ? 'strategies' : 'pipelines').data(pipeline).post()
      .then((p: IPipeline) => this.convertPipeline(p));
  }

  public renamePipeline(applicationName: string, pipeline: IPipeline, currentName: string, newName: string): ng.IPromise<void> {
    this.configViewStateCache.remove(this.buildViewStateCacheKey(applicationName, currentName));
    pipeline.name = newName;
    return this.API.one(pipeline.strategy ? 'strategies' : 'pipelines').one(pipeline.id).data(pipeline).put();
  }

  public triggerPipeline(applicationName: string, pipelineName: string, body: any = {}): ng.IPromise<void> {
    body.user = this.authenticationService.getAuthenticatedUser().name;
    return this.API.one('pipelines').one(applicationName).one(pipelineName).data(body).post();
  }

  public getDownstreamStageIds(pipeline: IPipeline, stage: IStage): (string | number)[] {
    let downstream: (string | number)[] = [];
    const children = pipeline.stages.filter((stageToTest: IStage) => {
      return stageToTest.requisiteStageRefIds &&
        stageToTest.requisiteStageRefIds.includes(stage.refId);
    });
    if (children.length) {
      downstream = children.map(c => c.refId);
      children.forEach((child) => {
        downstream = downstream.concat(this.getDownstreamStageIds(pipeline, child));
      });
    }
    return uniq(downstream);
  }

  public getDependencyCandidateStages(pipeline: IPipeline, stage: IStage): IStage[] {
    const downstreamIds: (string | number)[] = this.getDownstreamStageIds(pipeline, stage);
    return pipeline.stages.filter((stageToTest: IStage) => {
      return stage !== stageToTest &&
        stageToTest.requisiteStageRefIds &&
        !downstreamIds.includes(stageToTest.refId) &&
        !stage.requisiteStageRefIds.includes(stageToTest.refId);
    });
  }

  public getAllUpstreamDependencies(pipeline: IPipeline, stage: IStage): IStage[] {
    let upstreamStages: IStage[] = [];
    if (stage.requisiteStageRefIds && stage.requisiteStageRefIds.length) {
      pipeline.stages.forEach((stageToTest: IStage) => {
        if (stage.requisiteStageRefIds.includes(stageToTest.refId)) {
          upstreamStages.push(stageToTest);
          upstreamStages = upstreamStages.concat(this.getAllUpstreamDependencies(pipeline, stageToTest));
        }
      });
    }
    return uniq(upstreamStages);
  }

  public startAdHocPipeline(body: any): ng.IPromise<void> {
    body.user = this.authenticationService.getAuthenticatedUser().name;
    return this.API.one('pipelines').one('start').data(body).post();
  }

  private sortPipelines(pipelines: IPipeline[]): ng.IPromise<IPipeline[]> {

    const sorted = sortBy(pipelines, ['index', 'name']);

    // if there are pipelines with a bad index, fix that
    const toReindex: ng.IPromise<void>[] = [];
    if (sorted && sorted.length) {
      sorted.forEach((pipeline, index) => {
        if (pipeline.index !== index) {
          pipeline.index = index;
          toReindex.push(this.savePipeline(pipeline));
        }
      });
      if (toReindex.length) {
        return this.$q.all(toReindex).then(() => sorted);
      }
    }
    return this.$q.resolve(sorted);
  }

  // Note: convertPipeline() and replaceType() replaces `type` on stages and triggers, to be able to update Deck
  // independently of the backend. It happens when receiving pipeline config from the backend and before saving it.
  // Both functions can be removed when `Jenkins` is renamed to `CI` in the rest of Spinnaker as well.
  private convertPipeline(pipeline: IPipeline, from = 'jenkins', to = 'ci'): IPipeline {
    return Object.assign({}, pipeline, {
      stages: this.replaceType(pipeline.stages, from, to),
      triggers: this.replaceType(pipeline.triggers, from, to)
    });
  }

  private replaceType(iterable: Array<IStage | ITrigger>, from: string, to: string): any {
    if (iterable) {
      iterable = iterable.map(element => element.type === from ? Object.assign({}, element, {type: to}) : element);
    }
    return iterable;
  }

}

export const PIPELINE_CONFIG_SERVICE = 'spinnaker.core.pipeline.config.service';
module(PIPELINE_CONFIG_SERVICE, [
  API_SERVICE,
  AUTHENTICATION_SERVICE,
  VIEW_STATE_CACHE_SERVICE,
  require('../../../config/settings'),
]).service('pipelineConfigService', PipelineConfigService);
