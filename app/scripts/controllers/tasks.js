'use strict';

angular.module('deckApp')
  .controller('TasksCtrl', function($scope, tasks) {

    $scope.taskStateFilter = 'All';

    //$scope.subscribeTo(tasks.all);

    $scope.subscribed = {
      data: tasks,
    };

  });
