import type { IComponentOptions, IController } from 'angular';
import { module } from 'angular';
import { SETTINGS } from '../../../../config/settings';

export interface IManagedImageOption {
  id: string;
  shortDescription?: string;
  detailedDescription: string;
  isImageFamily?: boolean;
  displayName?: string;
}

export class BakeStageChooseManagedImageController implements IController {
  public model: any;
  public managedImageOptions: IManagedImageOption[];
  public onChange: () => any;

  public showRadioButtons = false;

  public $onChanges(): void {
    this.showRadioButtons = this.managedImageOptions && this.managedImageOptions.length <= 2;
  }

  public getManagedImageDescription(managedImageOption: IManagedImageOption): string {
    const managedImageName = managedImageOption?.displayName || managedImageOption?.id || '';
    if (managedImageOption?.shortDescription) {
      return `${managedImageName} (${managedImageOption.shortDescription})`;
    }
    return managedImageName;
  }
  public getManagedImageDetailedDescription(managedImageOption: IManagedImageOption): string {
    return managedImageOption.detailedDescription + (managedImageOption.isImageFamily ? ' (family)' : '');
  }

  public getManagedImageDisabled(managedImageOption: IManagedImageOption): boolean {
    const disabledImages = SETTINGS.disabledImages || [];
    return disabledImages.includes(managedImageOption.id);
  }
}

const bakeStageChooseManagedImageComponent: IComponentOptions = {
  bindings: {
    managedImageOptions: '<',
    model: '=',
    onChange: '=',
  },
  controller: BakeStageChooseManagedImageController,
  templateUrl: require('./bakeStageChooseManagedImage.component.html'),
};

export const PIPELINE_BAKE_STAGE_CHOOSE_MANAGED_IMAGE = 'spinnaker.core.pipeline.bake.chooseManagedImage.component';
module(PIPELINE_BAKE_STAGE_CHOOSE_MANAGED_IMAGE, []).component(
  'bakeStageChooseManagedImage',
  bakeStageChooseManagedImageComponent,
);
