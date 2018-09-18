import { IComponentOptions, module } from 'angular';

class ImageSourceSelectorComponent implements IComponentOptions {
  public bindings: any = { command: '=', imageSources: '<', helpFieldKey: '@', idField: '@', imageSourceText: '<' };
  public controllerAs = 'ctrl';
  public template = `
    <div class="form-group" ng-if="ctrl.imageSourceText">
      <div class="col-md-3 sm-label-right">
        Image Source
      </div>
      <div class="col-md-7" style="margin-top: 5px;">
        <span ng-bind-html="ctrl.imageSourceText"></span>
      </div>
    </div>
    <render-if-feature feature="artifacts" ng-if="!ctrl.imageSourceText">
      <div class="form-group">
        <div class="col-md-3 sm-label-right">
          Image Source
          <help-field key="{{ ctrl.helpFieldKey }}"></help-field>
        </div>
        <div class="col-md-7">
          <div class="radio" ng-repeat="imageSource in ctrl.imageSources">
            <label>
              <input type="radio" ng-model="ctrl.command[ctrl.idField]" value="{{ imageSource }}">
              {{ imageSource | robotToHuman }}
            </label>
          </div>
        </div>
      </div>
    </render-if-feature>
  `;
}

export const IMAGE_SOURCE_SELECTOR_COMPONENT = 'spinnaker.core.artifacts.expected.image.selector';
module(IMAGE_SOURCE_SELECTOR_COMPONENT, []).component('imageSourceSelector', new ImageSourceSelectorComponent());
