'use strict';

const angular = require('angular');

module.exports = angular
  .module('spinnaker.widgets.spelSelect.component', [])
  .component('spelSelect', {
    template:`
      <div class="navbar-form" style="padding: 0 ;">
        <div class="button-input" ng-class="{select: $ctrl.selectActive, text: $ctrl.textActive, focus: $ctrl.isGlowing}">
          <span class="btn-group btn-group-xs" role="group">
            <button type="button"
              class="btn btn-default"
              ng-click="$ctrl.toggleSelect()"
              ng-class="{active: $ctrl.selectActive}"
              ng-focus="$ctrl.glow(true)"
              ng-blur="$ctrl.glow(false)"
              uib-tooltip="Toggle for select">
              <span class="glyphicon glyphicon-triangle-bottom" style="font-size: 75%"></span>
              </button>
            <button type="button"
              class="btn btn-default"
              ng-click="$ctrl.toggleText()"
              ng-class="{active: $ctrl.expressionActive}"
              ng-focus="$ctrl.glow(true)"
              ng-blur="$ctrl.glow(false)"
              uib-tooltip="Toggle to enter expression">
              $\{…\}
              </button>
          </span>
          <input
            ng-if="$ctrl.expressionActive"
            type="text" class="form-control borderless"
            ng-model="$ctrl.model" ng-focus="$ctrl.glow(true)"
            ng-blur="$ctrl.glow(false)"
          />
          <div
            ng-transclude
            ng-if="$ctrl.selectActive"
            class="borderless input"
            ng-focus="$ctrl.glow(true)"
            ng-blur="$ctrl.glow(false)"
            >
          </div>

        </div>
      </div>
      `,
    bindings: {
      model: '=',
    },
    transclude: true,
    controller: function() {
      let ctrl = this;
      let select = 'select';
      let textType = 'text';

      let setState = (inputType) => {
        if(inputType == textType) {
          ctrl.expressionActive = true;
          ctrl.selectActive = false;
        } else {
          ctrl.selectActive = true;
          ctrl.expressionActive = false;
        }
      };

      ctrl.$onInit = () => {
        ctrl.inputType = ctrl.model && ctrl.model.includes('${') ? textType : select;
        setState(ctrl.inputType);
      };

      ctrl.toggleSelect = () => {
        setState(select);
      };

      ctrl.toggleText = () => {
        setState(textType);
      };

      ctrl.glow = (isGlowing) => {
        ctrl.isGlowing = isGlowing;
      };
    }
  });
