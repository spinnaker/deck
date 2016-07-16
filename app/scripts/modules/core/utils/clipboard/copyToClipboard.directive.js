'use strict';

let angular = require('angular');
let Clipboard = require('clipboard');

require('./copyToClipboard.directive.less');

module.exports = angular
  .module('spinnaker.core.utils.copyToClipboard.directive', [])
  .directive('copyToClipboard', function($timeout) {
    return {
      restrict: 'E',
      scope: {},
      template: `
      <button
        class="btn btn-xs btn-default clipboard-btn"
        uib-tooltip="{{cb.toolTip}}"
        tooltip-trigger="mouseenter"
        tooltip-placement="top"
        tooltip-enable="true"
        tooltip-is-open="cb.isOpen"
        analytics-on="click"
        analytics-category="Copy to Clipboard"
        analytics-event="{{cb.toolTip}}"
        analytics-label="{{cb.analyticsLabel || cb.text}}"
        data-clipboard-action="copy"
        data-clipboard-text="{{cb.text}}"
        aria-label="Copy to clipboard">
        <span class="glyphicon glyphicon-copy"></span>
      </button>`,

      bindToController: {
        text: '@',
        toolTip: '@',
        analyticsLabel: '@',
      },
      controller: 'copyToClipboardController',
      controllerAs: 'cb',
      link: function(scope, element, attrs, controller) {
        element.on('click', function() {
          controller.isOpen = true;
          controller.toggleToolTipToCopied();
          scope.$digest();
          $timeout(() => {
            controller.isOpen = false;
            controller.resetToolTip();
            scope.$digest();
          }, 3000);
        });
      }
    };
  })
  .controller('copyToClipboardController', function() {
    let vm = this;
    vm.isOpen = false;
    vm.toggleToolTipToCopied = () => {
      vm.tempToolTip = vm.toolTip;
      vm.toolTip = 'Copied';
    };

    vm.resetToolTip = () => {
      vm.toolTip = vm.tempToolTip;
    };
  })
  .config(function() {
    /*eslint-disable */
    let clipboard = new Clipboard('.clipboard-btn');
    /*eslint-enable*/
  });


