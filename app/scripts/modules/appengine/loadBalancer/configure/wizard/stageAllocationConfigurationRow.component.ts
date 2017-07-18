import { IController, IComponentOptions, module } from 'angular';
import { uniq } from 'lodash';

import { Application, StageConstants } from '@spinnaker/core';

import { IAppengineAllocationDescription } from 'appengine/loadBalancer/transformer';

class AppengineStageAllocationLabelCtrl implements IController {
  public inputViewValue: string;
  private allocationDescription: IAppengineAllocationDescription;

  private static mapTargetCoordinateToLabel(targetCoordinate: string): string {
    const target = StageConstants.TARGET_LIST.find(t => t.val === targetCoordinate);
    if (target) {
      return target.label;
    } else {
      return null;
    }
  }

  public $doCheck(): void {
    this.setInputViewValue();
  }

  private setInputViewValue(): void {
    switch (this.allocationDescription.locatorType) {
      case 'text':
        this.inputViewValue = this.allocationDescription.serverGroupName;
        break;
      case 'fromExisting':
        this.inputViewValue = this.allocationDescription.serverGroupName;
        break;
      case 'targetCoordinate':
        if (this.allocationDescription.cluster && this.allocationDescription.target) {
          const targetLabel = AppengineStageAllocationLabelCtrl.mapTargetCoordinateToLabel(this.allocationDescription.target);
          this.inputViewValue = `${targetLabel} (${this.allocationDescription.cluster})`;
        } else {
          this.inputViewValue = null;
        }
        break;
      default:
        this.inputViewValue = null;
        break;
    }
  }
}

class AppengineStageAllocationLabel implements IComponentOptions {
  public bindings: any = {allocationDescription: '<'};
  public controller: any = AppengineStageAllocationLabelCtrl;
  public template = `<input ng-model="$ctrl.inputViewValue" type="text" class="form-control input-sm" readonly/>`;
}

class AppengineStageAllocationConfigurationRowCtrl implements IController {
  public allocationDescription: IAppengineAllocationDescription;
  public serverGroupOptions: string[];
  public targets = StageConstants.TARGET_LIST;
  public clusterList: string[];
  public onAllocationChange: Function;
  private application: Application;
  private region: string;
  private account: string;

  constructor(private appListExtractorService: any) {
    'ngInject';
    const clusterFilter = this.appListExtractorService.clusterFilterForCredentialsAndRegion(this.account, this.region);
    this.clusterList = this.appListExtractorService.getClusters([this.application], clusterFilter);
  }

  public getServerGroupOptions(): string[] {
    if (this.allocationDescription.serverGroupName) {
      return uniq(this.serverGroupOptions.concat(this.allocationDescription.serverGroupName));
    } else {
      return this.serverGroupOptions;
    }
  }

  public onLocatorTypeChange(): void {
    // Prevents pipeline expressions (or non-existent server groups) from entering the dropdown.
    if (!this.serverGroupOptions.includes(this.allocationDescription.serverGroupName)) {
      delete this.allocationDescription.serverGroupName;
    }
    this.onAllocationChange();
  }
}

class AppengineStageAllocationConfigurationRow implements IComponentOptions {
  public bindings: any = {
    application: '<',
    region: '@',
    account: '@',
    allocationDescription: '<',
    removeAllocation: '&',
    serverGroupOptions: '<',
    onAllocationChange: '&'
  };
  public controller: any = AppengineStageAllocationConfigurationRowCtrl;
  public templateUrl = require('./stageAllocationConfigurationRow.component.html');
}

export const APPENGINE_STAGE_ALLOCATION_CONFIGURATION_ROW = 'spinnaker.appengine.stageAllocationConfigurationRow.component';
module(APPENGINE_STAGE_ALLOCATION_CONFIGURATION_ROW, [])
  .component('appengineStageAllocationConfigurationRow', new AppengineStageAllocationConfigurationRow())
  .component('appengineStageAllocationLabel', new AppengineStageAllocationLabel());

