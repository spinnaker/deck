'use strict';


angular.module('deckApp')
  .controller('DeliveryCtrl', function($scope, application) {
    $scope.lastVisibleExecutionIdx = 0;
    $scope.application = application;
  }
);

