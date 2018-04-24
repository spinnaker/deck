import { IController, IComponentOptions, module } from 'angular';

import { API, SETTINGS } from '@spinnaker/core';

class CanaryAnalysisNameSelectorController implements IController {
  public nameList: string[] = [];
  public queryListUrl: string;

  public $onInit(): void {
    this.queryListUrl = SETTINGS.canaryConfig ? SETTINGS.canaryConfig.queryListUrl : null;
    API.one('canaryConfig')
      .all('names')
      .getList()
      .then((results: string[]) => (this.nameList = results.sort()))
      .catch(() => {
        this.nameList = [];
      });
  }
}

class CanaryAnalysisNameSelectorComponent implements IComponentOptions {
  public bindings: any = {
    model: '=',
    className: '@',
  };
  public controller: any = CanaryAnalysisNameSelectorController;
  public templateUrl: string = require('./canaryAnalysisNameSelector.component.html');
}

export const CANARY_ANALYSIS_NAME_SELECTOR_COMPONENT = 'spinnaker.canary.canaryAnalysisNameSelector.component';
module(CANARY_ANALYSIS_NAME_SELECTOR_COMPONENT, []).component(
  'canaryAnalysisNameSelector',
  new CanaryAnalysisNameSelectorComponent(),
);
