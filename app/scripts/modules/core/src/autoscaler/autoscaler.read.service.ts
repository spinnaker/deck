import { IPromise, IQService, module } from 'angular';

import { API } from 'core/api/ApiService';
import { IAutoscalerSourceData } from 'core/domain';
import { CORE_AUTOSCALER_AUTOSCALER_TRANSFORMER } from './autoscaler.transformer';

export class AutoscalerReader {
  public static $inject = ['$q', 'autoscalerTransformer'];
  public constructor(private $q: IQService, private autoscalerTransformer: any) {}

  public loadAutoscalers(applicationName: string): IPromise<IAutoscalerSourceData[]> {
    return API.one('applications', applicationName)
      .all('autoscalers')
      .getList()
      .then((autoscalers: IAutoscalerSourceData[]) => {
        autoscalers = this.autoscalerTransformer.normalizeAutoscalerSet(autoscalers);
        return this.$q.all(autoscalers.map(as => this.autoscalerTransformer.normalizeAutoscaler(as)));
      });
  }
}

export const AUTOSCALER_READ_SERVICE = 'spinnaker.core.autoscaler.read.service';

module(AUTOSCALER_READ_SERVICE, [CORE_AUTOSCALER_AUTOSCALER_TRANSFORMER]).service('autoscalerReader', AutoscalerReader);
