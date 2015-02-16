'use strict';


angular.module('deckApp.loadBalancer.gce.create.controller', [
  'deckApp.loadBalancer.write.service',
  'deckApp.account.service',
  'deckApp.gce.loadBalancer.transformer.service',
  'deckApp.securityGroup.read.service',
  'deckApp.modalWizard',
  'deckApp.tasks.monitor.service'
])
  .controller('gceCreateLoadBalancerCtrl', function($scope, $modalInstance, $state, $exceptionHandler,
                                                 application, loadBalancer, isNew,
                                                 accountService, gceLoadBalancerTransformer, securityGroupReader,
                                                 _, searchService, modalWizardService, loadBalancerWriter, taskMonitorService) {

    var ctrl = this;

    $scope.isNew = isNew;

    $scope.state = {
      securityGroupsLoaded: false,
      accountsLoaded: false,
      loadBalancerNamesLoaded: false,
      submitting: false
    };

    $scope.taskMonitor = taskMonitorService.buildTaskMonitor({
      application: application,
      title: (isNew ? 'Creating ' : 'Updating ') + 'your load balancer',
      forceRefreshMessage: 'Getting your new load balancer from GCE...',
      modalInstance: $modalInstance,
      forceRefreshEnabled: true
    });

    var allSecurityGroups = {},
        allLoadBalancerNames = {};

    function initializeEditMode() {
      if ($scope.loadBalancer.vpcId) {
        preloadSecurityGroups().then(function() {
          updateAvailableSecurityGroups([$scope.loadBalancer.vpcId]);
        });
      }
    }

    function initializeCreateMode() {
      preloadSecurityGroups();
      accountService.listAccounts().then(function (accounts) {
        // TODO(duftler): Remove the filter once the account-select-field directive supports filtering on provider.
        $scope.accounts = accounts.filter(function (account) {
          return account.type === 'gce';
        });
        $scope.state.accountsLoaded = true;

        var accountNames = _.pluck($scope.accounts, 'name');
        if (accountNames.length && accountNames.indexOf($scope.loadBalancer.credentials) === -1) {
          $scope.loadBalancer.credentials = accountNames[0];
        }

        ctrl.accountUpdated();
      });
    }

    function preloadSecurityGroups() {
      return securityGroupReader.getAllSecurityGroups().then(function (securityGroups) {
        allSecurityGroups = securityGroups;
        $scope.state.securityGroupsLoaded = true;
      });
    }

    function initializeController() {
      if (loadBalancer) {
        $scope.loadBalancer = gceLoadBalancerTransformer.convertLoadBalancerForEditing(loadBalancer);
        initializeEditMode();
      } else {
        $scope.loadBalancer = gceLoadBalancerTransformer.constructNewLoadBalancerTemplate();
        initializeLoadBalancerNames();
        initializeCreateMode();
      }
    }

    function initializeLoadBalancerNames() {
      searchService.search('gate', {q: '', type: 'loadBalancers', pageSize: 100000}).then(function(searchResults) {
        searchResults.results.forEach(function(result) {
          if (!allLoadBalancerNames[result.account]) {
            allLoadBalancerNames[result.account] = {};
          }
          if (!allLoadBalancerNames[result.account][result.region]) {
            allLoadBalancerNames[result.account][result.region] = [];
          }
          allLoadBalancerNames[result.account][result.region].push(result.loadBalancer.toLowerCase());
          $scope.state.loadBalancerNamesLoaded = true;
          updateLoadBalancerNames();
        });
      });
    }

    function updateAvailableSecurityGroups(availableVpcIds) {
      var account = $scope.loadBalancer.credentials,
        region = $scope.loadBalancer.region;

      if (account && region && allSecurityGroups[account] && allSecurityGroups[account].aws[region]) {
        $scope.availableSecurityGroups = _.filter(allSecurityGroups[account].aws[region], function(securityGroup) {
          return availableVpcIds.indexOf(securityGroup.vpcId) !== -1;
        });
        $scope.existingSecurityGroupNames = _.collect($scope.availableSecurityGroups, 'name');
        var existingNames = ['nf-datacenter-vpc', 'nf-infrastructure-vpc'];
        $scope.loadBalancer.securityGroups.forEach(function(securityGroup) {
          if ($scope.existingSecurityGroupNames.indexOf(securityGroup) === -1) {
            var matches = _.filter($scope.availableSecurityGroups, {id: securityGroup});
            if (matches.length) {
              existingNames.push(matches[0].name);
            }
          } else {
            existingNames.push(securityGroup);
          }
        });
        $scope.loadBalancer.securityGroups = _.unique(existingNames);
      } else {
        clearSecurityGroups();
      }
    }

    function updateLoadBalancerNames() {
      var account = $scope.loadBalancer.credentials,
        region = $scope.loadBalancer.region;

      if (allLoadBalancerNames[account] && allLoadBalancerNames[account][region]) {
        $scope.usedLoadBalancerNames = allLoadBalancerNames[account][region];
      } else {
        $scope.usedLoadBalancerNames = [];
      }
    }

    function clearSecurityGroups() {
      $scope.availableSecurityGroups = [];
      $scope.existingSecurityGroupNames = [];
    }

    initializeController();

    // Controller API

    this.requiresHealthCheckPath = function () {
      return $scope.loadBalancer.healthCheckProtocol && $scope.loadBalancer.healthCheckProtocol.indexOf('HTTP') === 0;
    };

    this.updateName = function() {
      var elb = $scope.loadBalancer;
      elb.name = [application.name, (elb.stack || ''), (elb.detail || '')].join('-');
    };

    this.accountUpdated = function() {
      accountService.getRegionsForAccount($scope.loadBalancer.credentials).then(function(regions) {
        $scope.regions = Object.keys(regions);
        clearSecurityGroups();
        ctrl.regionUpdated();
      });
    };

    this.regionUpdated = function() {
      updateLoadBalancerNames();
      ctrl.updateName();
    };

    this.removeListener = function(index) {
      $scope.loadBalancer.listeners.splice(index, 1);
    };

    this.addListener = function() {
      $scope.loadBalancer.listeners.push({internalProtocol: 'HTTP', externalProtocol: 'HTTP'});
    };

    $scope.taskMonitor.onApplicationRefresh = function handleApplicationRefreshComplete() {
      $modalInstance.close();
      var newStateParams = {
        name: $scope.loadBalancer.name,
        accountId: $scope.loadBalancer.credentials,
        region: $scope.loadBalancer.region,
        provider: 'gce',
      };
      if (!$state.includes('**.loadBalancerDetails')) {
        $state.go('.loadBalancerDetails', newStateParams);
      } else {
        $state.go('^.loadBalancerDetails', newStateParams);
      }
    };


    this.submit = function () {
      var descriptor = isNew ? 'Create' : 'Update';

      $scope.taskMonitor.submit(
        function() {
          return loadBalancerWriter.upsertLoadBalancer($scope.loadBalancer, application, descriptor);
        }
      );
    };

    this.cancel = function () {
      $modalInstance.dismiss();
    };
  });
