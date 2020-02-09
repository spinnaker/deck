import { module, IQService } from 'angular';

import { ApplicationDataSourceRegistry } from 'core/application/service/ApplicationDataSourceRegistry';
import { INFRASTRUCTURE_KEY } from 'core/application/nav/defaultCategories';
import { Application } from 'core/application/application.model';
import { IAutoscaler } from 'core/domain';
import { AUTOSCALER_READ_SERVICE, AutoscalerReader } from './autoscaler.read.service';

export const AUTOSCALER_DATA_SOURCE = 'spinnaker.core.autoscaler.dataSource';
module(AUTOSCALER_DATA_SOURCE, [AUTOSCALER_READ_SERVICE]).run([
  '$q',
  'autoscalerReader',
  ($q: IQService, autoscalerReader: AutoscalerReader) =>
    ApplicationDataSourceRegistry.registerDataSource({
      key: 'autoscalers',
      label: 'autoscalers',
      category: INFRASTRUCTURE_KEY,
      optional: true,
      icon: 'fa fa-xs fa-fw icon-balance-scale',
      loader: (application: Application) => autoscalerReader.loadAutoscalers(application.name),
      onLoad: (_application: Application, autoscalerList: IAutoscaler[]) => $q.when(autoscalerList),
      providerField: 'cloudProvider',
      credentialsField: 'account',
      regionField: 'region',
      description: 'Server group autoscaling.',
      defaultData: [],
      visible: false,
    }),
]);
