'use strict';


angular.module('deckApp')
  .factory('oortService', function (pipelineService, searchService, settings, $q, Restangular, _, $timeout, clusterService, loadBalancerService, pond, securityGroupService, scheduler, taskTracker, $exceptionHandler/*, scheduledCache*/) {

    var applicationListEndpoint = Restangular.withConfig(function(RestangularConfigurer) {
      RestangularConfigurer.setBaseUrl(settings.oortUrl);
    });

    var oortEndpoint = Restangular.withConfig(function(RestangularConfigurer) {
      RestangularConfigurer.setBaseUrl(settings.oortUrl);

      RestangularConfigurer.addElementTransformer('applications', false, function(application) {

        function refreshApplication() {
          return getApplication(application.name).then(function (newApplication) {
            taskTracker.handleTaskUpdates(
              application.tasks,
              newApplication.tasks
            );

            deepCopyApplication(application, newApplication);
            application.autoRefreshHandlers.forEach(function(handler) {
              handler.call();
            });
            newApplication = null;
          });
        }

        application.autoRefreshHandlers = [];

        application.registerAutoRefreshHandler = function(method, scope) {
          application.autoRefreshHandlers.push(method);
          scope.$on('$destroy', function () {
            application.autoRefreshHandlers = application.autoRefreshHandlers.filter(function(handler) {
              return handler !== method;
            });
          });
        };

        function autoRefresh(scope) {
          if (application.autoRefreshEnabled) {
            var disposable = scheduler.subscribe(refreshApplication);
            scope.$on('$destroy', function () {
              application.disableAutoRefresh();
              disposable.dispose();
            });
          }
        }

        application.refreshImmediately = refreshApplication;

        application.disableAutoRefresh = function disableAutoRefresh() {
          application.autoRefreshEnabled = false;
        };

        application.enableAutoRefresh = function enableAutoRefresh(scope) {
          application.autoRefreshEnabled = true;
          autoRefresh(scope);
        };

        application.getCluster = function getCluster(accountName, clusterName) {
          var matches = application.clusters.filter(function (cluster) {
            return cluster.name === clusterName && cluster.account === accountName;
          });
          return matches.length ? matches[0] : null;
        };

        if (application.fromServer) {
          application.accounts = Object.keys(application.clusters);
        }
        return application;

      });
    });

    function listApplications() {
      return applicationListEndpoint
        .all('applications')
//        .withHttpConfig({cache: scheduledCache })
        .getList();
    }

    function getApplicationEndpoint(application) {
      return oortEndpoint.one('applications', application);
    }

    function deepCopyApplication(original, newApplication) {
      original.accounts = newApplication.accounts;
      original.clusters = newApplication.clusters;
      original.loadBalancers = newApplication.loadBalancers;
      original.tasks = newApplication.tasks;
      original.securityGroups = newApplication.securityGroups;
      original.pipelines = newApplication.pipelines;
      newApplication.accounts = null;
      newApplication.clusters = null;
      newApplication.loadBalancers = null;
      newApplication.tasks = null;
      newApplication.securityGroups = null;
    }

    function getApplication(applicationName) {
      var securityGroupsByApplicationNameLoader = securityGroupService.loadSecurityGroupsByApplicationName(applicationName),
          loadBalancersByApplicationNameLoader = loadBalancerService.loadLoadBalancersByApplicationName(applicationName),
          applicationLoader = getApplicationEndpoint(applicationName).get();

      return $q.all({
        securityGroups: securityGroupsByApplicationNameLoader,
        loadBalancersByApplicationName: loadBalancersByApplicationNameLoader,
        application: applicationLoader
      })
        .then(function(applicationLoader) {
          var application = applicationLoader.application;
          var securityGroupAccounts = _(applicationLoader.securityGroups).pluck('account').unique().value();
          var loadBalancerAccounts = _(applicationLoader.loadBalancersByApplicationName).pluck('account').unique().value();
          application.accounts = _([applicationLoader.application.accounts, securityGroupAccounts, loadBalancerAccounts])
            .flatten()
            .compact()
            .unique()
            .value();

          var clusterLoader = clusterService.loadClusters(application);
          var loadBalancerLoader = loadBalancerService.loadLoadBalancers(application, applicationLoader.loadBalancersByApplicationName);
          var securityGroupLoader = securityGroupService.loadSecurityGroups(application);

          var taskLoader = pond.one('applications', applicationName)
            .all('tasks')
            .getList();

          var pipelineLoader = pond.one('applications', applicationName)
            .all('pipelines')
            .getList();

          return $q.all({
            clusters: clusterLoader,
            loadBalancers: loadBalancerLoader,
            tasks: taskLoader,
            pipelines: pipelineLoader,
            securityGroups: securityGroupLoader
          })
            .then(function(results) {
              application.clusters = results.clusters;
              application.serverGroups = _.flatten(_.pluck(results.clusters, 'serverGroups'));
              application.loadBalancers = results.loadBalancers;
              application.tasks = angular.isArray(results.tasks) ? results.tasks : [];
              application.pipelines = angular.isArray(results.pipelines) ? results.pipelines : [];
              loadBalancerService.normalizeLoadBalancersWithServerGroups(application);
              clusterService.normalizeServerGroupsWithLoadBalancers(application);
              securityGroupService.attachSecurityGroups(application, results.securityGroups, applicationLoader.securityGroups);
              pipelineService.normalizePipelines(application);

              return application;
            }, function(err) {
              $exceptionHandler(err, 'Failed to load application');
            });
        });
    }

    function findImages(query, region, credentials) {
      if (query.length < 3) {
        return $q.when([{message: 'Please enter at least 3 characters...'}]);
      }
      return oortEndpoint.all('aws/images/find').getList({imageName: query, region: region, credentials: credentials}, {}).then(function(results) {
        return results;
      },
      function() {
        return [];
      });
    }

    function getAmi(amiName, region, credentials) {
      return oortEndpoint.all('aws/images').one(credentials).one(region).all(amiName).getList().then(function(results) {
        return results && results.length ? results[0] : null;
      },
      function() {
        return null;
      });
    }

    function listLoadBalancers() {
      return applicationListEndpoint
        .all('aws/loadBalancers')
//        .withHttpConfig({cache: scheduledCache })
        .getList();
    }

    return {
      listApplications: listApplications,
      getApplication: getApplication,
      findImages: findImages,
      getAmi: getAmi,
      listLoadBalancers: listLoadBalancers,
      getApplicationWithoutAppendages: getApplicationEndpoint,
    };
  });
