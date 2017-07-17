import { IComponentController, IComponentOptions, module } from 'angular';
import { IModalService } from 'angular-ui-bootstrap';
import { SCALING_ACTIVITIES_CTRL, ScalingActivitiesCtrl } from './scalingActivities.controller';

class ViewScalingActivitiesLinkCtrl implements IComponentController {
  public serverGroup: any;

  public constructor(private $uibModal: IModalService) { 'ngInject'; }

  public showScalingActivities(): void {
    this.$uibModal.open({
      templateUrl: require('./scalingActivities.html'),
      controller: ScalingActivitiesCtrl,
      controllerAs: '$ctrl',
      resolve: {
        serverGroup: () => this.serverGroup
      }
    });
  }

  // Satisfy TypeScript 2.4 breaking change: https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#weak-type-detection
  public $onInit() {}
}

class ViewScalingActivitiesLink implements IComponentOptions {
  public bindings: any = {
    serverGroup: '='
  };
  public controller: any = ViewScalingActivitiesLinkCtrl;
  public template = `<a href ng-click="$ctrl.showScalingActivities()">View Scaling Activities</a>`;
}

export const VIEW_SCALING_ACTIVITIES_LINK = 'spinnaker.core.serverGroup.details.viewScalingActivities.link';

module(VIEW_SCALING_ACTIVITIES_LINK, [
    SCALING_ACTIVITIES_CTRL,
  ])
  .component('viewScalingActivitiesLink', new ViewScalingActivitiesLink());
