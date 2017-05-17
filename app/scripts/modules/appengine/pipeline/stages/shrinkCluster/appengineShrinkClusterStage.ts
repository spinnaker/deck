import { module } from 'angular';

import { ACCOUNT_SERVICE, AccountService, PipelineTemplates } from '@spinnaker/core';

import { IAppengineStage, IAppengineStageScope } from 'appengine/domain/index';
import { AppengineStageCtrl } from '../appengineStage.controller';

interface IAppengineShrinkClusterStage extends IAppengineStage {
  shrinkToSize: number;
  allowDeleteActive: boolean;
  retainLargerOverNewer: string | boolean;
}

class AppengineShrinkClusterStageCtrl extends AppengineStageCtrl {
  constructor(public $scope: IAppengineStageScope, accountService: AccountService) {
    'ngInject';
    super($scope, accountService);

    super.setAccounts().then(() => { super.setStageRegion(); });
    super.setStageCloudProvider();
    super.setStageCredentials();

    const stage = $scope.stage as IAppengineShrinkClusterStage;
    if (stage.shrinkToSize === undefined) {
      stage.shrinkToSize = 1;
    }

    if (stage.allowDeleteActive === undefined) {
      stage.allowDeleteActive = false;
    }

    if (stage.retainLargerOverNewer === undefined) {
      stage.retainLargerOverNewer = 'false';
    }

    stage.retainLargerOverNewer = stage.retainLargerOverNewer.toString();
  }

  public pluralize(str: string, val: number): string {
    return val === 1 ? str : str + 's';
  }
}

export const APPENGINE_SHRINK_CLUSTER_STAGE = 'spinnaker.appengine.pipeline.stage.shrinkClusterStage';

module(APPENGINE_SHRINK_CLUSTER_STAGE, [ACCOUNT_SERVICE])
  .config(function(pipelineConfigProvider: any) {
    pipelineConfigProvider.registerStage({
      provides: 'shrinkCluster',
      cloudProvider: 'appengine',
      templateUrl: require('./shrinkClusterStage.html'),
      executionDetailsUrl: PipelineTemplates.shrinkClusterExecutionDetails,
      validators: [
        { type: 'requiredField', fieldName: 'cluster' },
        { type: 'requiredField', fieldName: 'shrinkToSize', fieldLabel: 'shrink to [X] Server Groups'},
        { type: 'requiredField', fieldName: 'credentials', fieldLabel: 'account'},
      ],
    });
  }).controller('appengineShrinkClusterStageCtrl', AppengineShrinkClusterStageCtrl);
