'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.serverGroup.configure.kubernetes.templateSelection.controller', [
  require('../../../../core/serverGroup/serverGroup.read.service.js'),
  require('../../../../core/utils/lodash.js'),
  require('../CommandBuilder.js'),
])
  .controller('kubernetesServerGroupTemplateSelectionController', function($scope, kubernetesServerGroupCommandBuilder, serverGroupReader, _) {
    var controller = this;

    var noTemplate = { label: 'None', serverGroup: null, cluster: null };

    $scope.command.viewState.template = noTemplate;

    $scope.templates = [ noTemplate ];

    var allClusters = _.groupBy(_.filter($scope.application.serverGroups.data, { type: 'kubernetes', category: 'serverGroup' }), function(serverGroup) {
      return [serverGroup.cluster, serverGroup.account, serverGroup.region].join(':');
    });

    _.forEach(allClusters, function(cluster) {
      var latest = _.sortBy(cluster, 'name').pop();
      $scope.templates.push({
        cluster: latest.cluster,
        account: latest.account,
        region: latest.region,
        serverGroupName: latest.name,
        serverGroup: latest
      });
    });

    function applyCommandToScope(command) {
      command.viewState.disableImageSelection = true;
      command.viewState.disableStrategySelection = $scope.command.viewState.disableStrategySelection || false;
      command.viewState.submitButtonLabel = 'Add';
      angular.copy(command, $scope.command);
    }

    function buildEmptyCommand() {
      return kubernetesServerGroupCommandBuilder.buildNewServerGroupCommand($scope.application, {mode: 'createPipeline'}).then(function(command) {
        applyCommandToScope(command);
      });
    }

    function buildCommandFromTemplate(serverGroup) {
      return serverGroupReader.getServerGroup($scope.application.name, serverGroup.account, serverGroup.region, serverGroup.name).then(function (details) {
        return kubernetesServerGroupCommandBuilder.buildServerGroupCommandFromExisting($scope.application, details, 'editPipeline').then(function (command) {
          applyCommandToScope(command);
        });
      });
    }

    controller.selectTemplate = function () {
      var selection = $scope.command.viewState.template;
      if (selection && selection.cluster && selection.serverGroup) {
        return buildCommandFromTemplate(selection.serverGroup);
      } else {
        return buildEmptyCommand();
      }
    };

    controller.useTemplate = function() {
      $scope.state.loaded = false;
      controller.selectTemplate().then(function() {
        $scope.$emit('template-selected');
      });
    };
  });
