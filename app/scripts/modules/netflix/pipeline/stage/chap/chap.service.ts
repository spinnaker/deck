import {module} from 'angular';
import {API_SERVICE, Api} from 'core/api/api.service';

export interface IChapTestCase {
  id: string;
  name: string;
}

export class ChapService {

  static get $inject() { return ['API']; }

  public constructor(private API: Api) {}

  public listTestCases(): ng.IPromise<IChapTestCase[]> {
    return this.API.all('chap').all('testcases').getList();
  }
}

export const CHAP_SERVICE = 'spinnaker.netflix.pipeline.stage.chap.service';
module(CHAP_SERVICE, [API_SERVICE])
  .service('chapService', ChapService);
