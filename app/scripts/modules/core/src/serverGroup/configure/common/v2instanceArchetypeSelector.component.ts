import { module, IComponentController, IScope, IComponentOptions } from 'angular';
import { includes } from 'lodash';

import { CloudProviderRegistry } from 'core/cloudProvider';
import { ModalWizard } from 'core/modal/wizard/ModalWizard';
import { InstanceTypeService, IInstanceTypeCategory } from 'core/instance';
import { IServerGroupCommand } from './serverGroupCommandBuilder.service';
import { CORE_SERVERGROUP_CONFIGURE_COMMON_COSTFACTOR } from './costFactor';
import { CORE_PRESENTATION_ISVISIBLE_ISVISIBLE_DIRECTIVE } from 'core/presentation/isVisible/isVisible.directive';

class V2InstanceArchetypeSelectorController implements IComponentController {
  private command: IServerGroupCommand;
  public getInstanceBuilderTemplate: any;
  public onProfileChanged: any;
  public onTypeChanged: any;

  public static $inject = ['$scope', 'instanceTypeService'];
  public constructor(public $scope: IScope, private instanceTypeService: InstanceTypeService) {}

  public $onInit(): void {
    const { $scope } = this;
    this.instanceTypeService.getCategories(this.command.selectedProvider).then(categories => {
      $scope.instanceProfiles = categories;
      if ($scope.instanceProfiles.length % 3 === 0) {
        $scope.columns = 3;
      }
      if ($scope.instanceProfiles.length % 4 === 0) {
        $scope.columns = 4;
      }
      if ($scope.instanceProfiles.length % 5 === 0 || $scope.instanceProfiles.length === 7) {
        $scope.columns = 5;
      }
      this.selectInstanceType(this.command.viewState.instanceProfile);
    });

    if (this.command.region && this.command.instanceType && !this.command.viewState.instanceProfile) {
      this.selectInstanceType('custom');
    }

    this.getInstanceBuilderTemplate = CloudProviderRegistry.getValue.bind(
      CloudProviderRegistry,
      this.command.cloudProvider,
      'instance.customInstanceBuilderTemplateUrl',
    );

    $scope.$watch('$ctrl.command.instanceType', () => this.updateInstanceType());
  }

  private selectInstanceType = (type: string) => {
    const { $scope } = this;
    if ($scope.selectedInstanceProfile && $scope.selectedInstanceProfile.type === type) {
      type = null;
      $scope.selectedInstanceProfile = null;
    }
    this.command.viewState.instanceProfile = type;
    this.onProfileChanged && this.onProfileChanged(type);
    $scope.instanceProfiles.forEach((profile: IInstanceTypeCategory) => {
      if (profile.type === type) {
        $scope.selectedInstanceProfile = profile;
        const current = this.command.instanceType;
        if (current && !includes(['custom', 'buildCustom'], profile.type)) {
          const found = profile.families.some(family =>
            family.instanceTypes.some(instanceType => instanceType.name === current && !instanceType.unavailable),
          );
          if (!found) {
            this.command.instanceType = null;
          }
        }
      }
    });
  };

  private updateInstanceType = () => {
    if (ModalWizard.renderedPages.length > 0) {
      if (this.command.instanceType) {
        ModalWizard.markComplete('instance-type');
      } else {
        ModalWizard.markIncomplete('instance-type');
      }
    }
  };

  public updateInstanceTypeDetails = () => {
    this.instanceTypeService
      .getInstanceTypeDetails(this.command.selectedProvider, this.command.instanceType)
      .then(instanceTypeDetails => {
        this.command.viewState.instanceTypeDetails = instanceTypeDetails;
      });

    this.onTypeChanged && this.onTypeChanged(this.command.instanceType);
  };
}

export const v2InstanceArchetypeSelector: IComponentOptions = {
  bindings: {
    command: '<',
    onProfileChanged: '=',
    onTypeChanged: '=',
  },
  controller: V2InstanceArchetypeSelectorController,
  controllerAs: 'instanceArchetypeCtrl',
  templateUrl: require('./v2instanceArchetype.directive.html'),
};

export const V2_INSTANCE_ARCHETYPE_SELECTOR = 'spinnaker.core.serverGroup.configure.common.v2instanceArchetypeSelector';
module(V2_INSTANCE_ARCHETYPE_SELECTOR, [
  CORE_SERVERGROUP_CONFIGURE_COMMON_COSTFACTOR,
  CORE_PRESENTATION_ISVISIBLE_ISVISIBLE_DIRECTIVE,
]).component('v2InstanceArchetypeSelector', v2InstanceArchetypeSelector);
