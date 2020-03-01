import { IPromise, module } from 'angular';

import { API } from 'core/api/ApiService';
import { IAutoscalerSourceData } from 'core/domain';

export class AutoscalerReader {
  public constructor() {}

  public loadAutoscalers(applicationName: string): IPromise<IAutoscalerSourceData[]> {
    return API.one('applications', applicationName)
      .all('autoscalers')
      .getList();
  }
}

export const AUTOSCALER_READ_SERVICE = 'spinnaker.core.autoscaler.read.service';

module(AUTOSCALER_READ_SERVICE, []).service('autoscalerReader', AutoscalerReader);
