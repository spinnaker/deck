'use strict';

import _ from 'lodash';

let angular = require('angular');

module.exports = angular.module('spinnaker.serverGroup.configure.aws.deployInitialization.controller', [
  require('core/serverGroup/serverGroup.read.service.js'),
  require('../../serverGroupCommandBuilder.service.js'),
])
  .controller('awsDeployInitializerCtrl', function($scope, awsServerGroupCommandBuilder, serverGroupReader) {
    var controller = this;

    $scope.templates = [];
    if (!$scope.command.viewState.disableNoTemplateSelection) {
      var noTemplate = { label: 'None', serverGroup: null, cluster: null };

      $scope.command.viewState.template = noTemplate;

      $scope.templates = [ noTemplate ];
    }

    var allClusters = _.groupBy(_.filter($scope.application.serverGroups.data, { type: 'aws' }), function(serverGroup) {
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
      command.viewState.imageId = null;
      command.viewState.readOnlyFields = $scope.command.viewState.readOnlyFields || {};
      command.viewState.submitButtonLabel = 'Add';
      command.viewState.hideClusterNamePreview = $scope.command.viewState.hideClusterNamePreview || false;
      command.viewState.templatingEnabled = true;
      if ($scope.command.viewState.overrides) {
        _.forOwn($scope.command.viewState.overrides, function(val, key) {
          command[key] = val;
        });
      }
      angular.copy(command, $scope.command);
    }

    function buildEmptyCommand() {
      return awsServerGroupCommandBuilder.buildNewServerGroupCommand($scope.application, {mode: 'createPipeline'}).then(function(command) {
        applyCommandToScope(command);
      });
    }

    function buildCommandFromTemplate(serverGroup) {
      return serverGroupReader.getServerGroup($scope.application.name, serverGroup.account, serverGroup.region, serverGroup.name).then(function (details) {
        angular.extend(details, serverGroup);
        return awsServerGroupCommandBuilder.buildServerGroupCommandFromExisting($scope.application, details, 'editPipeline').then(function (command) {
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
