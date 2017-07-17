import { IComponentController } from 'angular';
import { InsightFilterStateModel } from './insightFilterState.model';
import { INSIGHT_NGMODULE } from './insight.module';

export class InsightFilterCtrl implements IComponentController {
  constructor(public InsightFilterStateModel: InsightFilterStateModel) { 'ngInject'; }

  // Satisfy TypeScript 2.4 breaking change: https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#weak-type-detection
  public $onInit() {}
}

INSIGHT_NGMODULE.component('insightFilter', {
  templateUrl: require('./insightFilter.component.html'),
  controller: InsightFilterCtrl,
  transclude: true,
  bindings: {
    hidden: '<',
  }
});
