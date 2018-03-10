/*
 * Copyright 2018 Google, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License")
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { IComponentOptions, IController, module } from 'angular';

class ImageSourceSelectorCtrl implements IController {
  public command: any;
  public imageSources: string;
  public helpFieldKey: string;
  public idField: string;
}

class ImageSourceSelectorComponent implements IComponentOptions {
  public bindings: any = { command: '=', imageSources: '<', helpFieldKey: '@', idField: '@' };
  public controller: any = ImageSourceSelectorCtrl;
  public controllerAs = 'ctrl';
  public template = `
    <render-if-feature feature="artifacts">
      <div class="form-group">
        <div class="col-md-3 sm-label-right">
          Image Source
          <help-field key="{{ ctrl.helpFieldKey }}"></help-field>
        </div>
        <div class="col-md-9">
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
module(IMAGE_SOURCE_SELECTOR_COMPONENT, [
]).component('imageSourceSelector', new ImageSourceSelectorComponent());
