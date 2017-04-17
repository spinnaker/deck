'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.core.pipeline.stage.bake.modal.addExtendedAttribute', [])
  .controller('bakeStageAddExtendedAttributeController', function ($scope, $uibModalInstance, extendedAttribute) {

    var vm = this;
    $scope.extendedAttribute = angular.copy(extendedAttribute);

    vm.submit = function() {
      $uibModalInstance.close($scope.extendedAttribute);
    };

    return vm;
  });
