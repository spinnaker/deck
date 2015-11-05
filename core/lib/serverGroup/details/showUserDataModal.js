const angular = require('angular');

module.exports = angular.module('spinnaker.core.serverGroup.details.showUserDataModal', [
  require('angular-ui-bootstrap'),
]).factory('showUserDataModal', function($uibModal) {
  return {
    showUserDataModal(scope) {
      $uibModal.open({
        templateUrl: require('./userData.html'),
        controller: 'CloseableModalCtrl',
        scope: scope,
      });
    }
  }
});
