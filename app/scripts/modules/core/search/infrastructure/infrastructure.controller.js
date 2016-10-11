'use strict';

import _ from 'lodash';

let angular = require('angular');

module.exports = angular.module('spinnaker.search.infrastructure.controller', [
  require('./infrastructureSearch.service.js'),
  require('core/history/recentHistory.service.js'),
  require('../searchResult/searchResult.directive.js'),
  require('core/pageTitle/pageTitle.service.js'),
  require('./project/infrastructureProject.directive.js'),
  require('../searchRank.filter.js'),
  require('core/cluster/filter/clusterFilter.service.js'),
  require('core/cache/cacheInitializer.js'),
  require('core/overrideRegistry/override.registry.js'),
])
  .controller('InfrastructureCtrl', function($scope, infrastructureSearchService, $stateParams, $location, searchService,
                                             cacheInitializer, overrideRegistry,
                                             pageTitleService, recentHistoryService, $uibModal, $state, clusterFilterService) {

    var search = infrastructureSearchService();

    $scope.categories = [];
    $scope.projects = [];

    $scope.viewState = {
      searching: false,
      minCharactersToSearch: 3,
    };

    this.clearFilters = clusterFilterService.overrideFiltersForUrl;

    this.loadRecentItems = () => {
      $scope.recentProjects = recentHistoryService.getItems('projects');

      $scope.recentItems = ['applications', 'loadBalancers', 'serverGroups', 'instances', 'securityGroups']
        .map((category) => {
          return {
            category: category,
            results: recentHistoryService.getItems(category)
              .map((result) => {
                let routeParams = angular.extend(result.params, result.extraData);
                search.formatRouteResult(category, routeParams, true).then((name) => result.displayName = name);
                return result;
              })
          };
        })
        .filter((category) => {
          return category.results.length;
        });

      this.hasRecentItems = $scope.recentItems.some((category) => {
        return category.results.length > 0;
      });
    };

    function updateLocation() {
      $location.search('q', $scope.query || null);
      $location.replace();
    }

    $scope.pageSize = searchService.defaultPageSize;
    var autoNavigate = false;

    if (angular.isDefined($location.search().q)) {
      $scope.query = $location.search().q;
      autoNavigate = !!$location.search().route;
      // clear the parameter - it only comes from shortcut links, and if there are more than one result,
      // we don't want to automatically route the user or have them copy this as a link
      $location.search('route', null);
    }
    $scope.$watch('query', function(query) {
      $scope.categories = [];
      $scope.projects = [];
      if (query && query.length < $scope.viewState.minCharactersToSearch) {
        $scope.viewState.searching = false;
        updateLocation();
        return;
      }
      $scope.viewState.searching = true;
      search.query(query).then(function(result) {
        let allResults = _.flatten(result.map(r => r.results));
        if (allResults.length === 1 && autoNavigate) {
          $location.url(allResults[0].href.substring(1));
        } else {
          // clear auto-navigation so, if the user does another search, and that returns a single result, we don't
          // surprise them by navigating to it
          autoNavigate = false;
        }
        $scope.categories = result.filter((category) => category.category !== 'Projects' && category.results.length);
        $scope.projects = result.filter((category) => category.category === 'Projects' && category.results.length);
        $scope.moreResults = _.sumBy(result, function(resultSet) {
          return resultSet.results.length;
        }) === $scope.pageSize;
        updateLocation();
        pageTitleService.handleRoutingSuccess(
          {
            pageTitleMain: {
              label: query ? ' search results for "' + query + '"' : 'Infrastructure'
            }
          }
        );
        $scope.viewState.searching = false;
      });
    });

    this.createProject = () => {
      $uibModal.open({
        scope: $scope,
        templateUrl: require('../../projects/configure/configureProject.modal.html'),
        controller: 'ConfigureProjectModalCtrl',
        controllerAs: 'ctrl',
        size: 'lg',
        resolve: {
          projectConfig: () => { return {}; },
        }
      }).result.then(routeToProject);
    };

    function routeToProject(project) {
      $state.go(
        'home.project.dashboard', {
          project: project.name,
        }
      );
    }

    this.createApplication = () => {
      $uibModal.open({
        scope: $scope,
        templateUrl: overrideRegistry.getTemplate('createApplicationModal', require('../../application/modal/newapplication.html')),
        controller: overrideRegistry.getController('CreateApplicationModalCtrl'),
        controllerAs: 'newAppModal'
      }).result.then(routeToApplication);
    };

    function routeToApplication(app) {
      $state.go(
        'home.applications.application.insight.clusters', {
          application: app.name,
        }
      );
    }

    let refreshMenuItem = {
      displayName: 'Refresh all caches',
      disableAutoClose: true,
    };

    refreshMenuItem.action = (status) => {
      let originalDisplayName = refreshMenuItem.displayName;
      refreshMenuItem.displayName = '<span class="small glyphicon glyphicon-spinning glyphicon-refresh"></span> Refreshing...';
      cacheInitializer.refreshCaches().then(() => {
        refreshMenuItem.displayName = originalDisplayName;
        status.isOpen = false;
      });
    };

    this.menuActions = [
      {
        displayName: 'Create Application',
        action: this.createApplication
      },
      {
        displayName: 'Create Project',
        action: this.createProject
      },
      refreshMenuItem,
    ];

    this.hasResults = () => {
      return $scope.categories.length || $scope.projects.length;
    };

    this.noMatches = () => !this.hasResults() && $scope.query && $scope.query.length > 0;

    this.showRecentResults = () => this.hasRecentItems && !$scope.viewState.searching && !$scope.projects.length && $scope.categories.every((category) => !category.results.length);

    this.removeRecentItem = (category, id) => {
      recentHistoryService.removeItem(category, id);
      this.loadRecentItems();
    };

    this.removeRecentProject = (id) => {
      recentHistoryService.removeItem('projects', id);
      this.loadRecentItems();
    };

    this.loadRecentItems();

  });
