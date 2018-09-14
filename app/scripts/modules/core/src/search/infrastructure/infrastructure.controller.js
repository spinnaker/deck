'use strict';

import _ from 'lodash';

const angular = require('angular');

import { FirewallLabels } from 'core/securityGroup/label';
import { SEARCH_RANK_FILTER } from '../searchRank.filter';
import { CACHE_INITIALIZER_SERVICE } from 'core/cache/cacheInitializer.service';
import { OVERRIDE_REGISTRY } from 'core/overrideRegistry/override.registry';
import { PAGE_TITLE_SERVICE } from 'core/pageTitle/pageTitle.service';
import { INFRASTRUCTURE_SEARCH_SERVICE } from 'core/search/infrastructure/infrastructureSearch.service';
import { SPINNER_COMPONENT } from 'core/widgets/spinners/spinner.component';
import { SEARCH_RESULT_COMPONENT } from '../infrastructure/searchResult.component';
import { PROJECT_SUMMARY_POD_COMPONENT } from '../infrastructure/projectSummaryPod.component';
import { RECENTLY_VIEWED_ITEMS_COMPONENT } from '../infrastructure/recentlyViewedItems.component';
import { ClusterState } from 'core/state';

import { SearchService } from '../search.service';

module.exports = angular
  .module('spinnaker.search.infrastructure.controller', [
    INFRASTRUCTURE_SEARCH_SERVICE,
    SEARCH_RESULT_COMPONENT,
    PAGE_TITLE_SERVICE,
    PROJECT_SUMMARY_POD_COMPONENT,
    SEARCH_RANK_FILTER,
    CACHE_INITIALIZER_SERVICE,
    OVERRIDE_REGISTRY,
    RECENTLY_VIEWED_ITEMS_COMPONENT,
    SPINNER_COMPONENT,
  ])
  .controller('InfrastructureCtrl', function(
    $scope,
    infrastructureSearchService,
    $stateParams,
    $location,
    cacheInitializer,
    overrideRegistry,
    pageTitleService,
    $uibModal,
    $state,
  ) {
    var search = infrastructureSearchService.getSearcher();

    $scope.firewallsLabel = FirewallLabels.get('firewalls');

    $scope.categories = [];
    $scope.projects = [];

    $scope.viewState = {
      searching: false,
      minCharactersToSearch: 3,
    };

    this.clearFilters = r => ClusterState.filterService.overrideFiltersForUrl(r);

    function updateLocation() {
      $location.search('q', $scope.query || null);
      $location.replace();
    }

    $scope.pageSize = SearchService.DEFAULT_PAGE_SIZE;
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
      search.query(query).then(function(resultSets) {
        let allResults = _.flatten(resultSets.map(r => r.results));
        if (allResults.length === 1 && autoNavigate) {
          $location.url(allResults[0].href.substring(1));
        } else {
          // clear auto-navigation so, if the user does another search, and that returns a single result, we don't
          // surprise them by navigating to it
          autoNavigate = false;
        }
        $scope.categories = resultSets
          .filter(resultSet => resultSet.type.id !== 'projects' && resultSet.results.length)
          .sort((a, b) => a.type.id - b.type.id);
        $scope.projects = resultSets.filter(resultSet => resultSet.type.id === 'projects' && resultSet.results.length);
        $scope.moreResults =
          _.sumBy(resultSets, function(resultSet) {
            return resultSet.results.length;
          }) === $scope.pageSize;
        updateLocation();
        pageTitleService.handleRoutingSuccess({
          pageTitleMain: {
            label: query ? ' search results for "' + query + '"' : 'Infrastructure',
          },
        });
        $scope.viewState.searching = false;
      });
    });

    this.createProject = () => {
      $uibModal
        .open({
          scope: $scope,
          templateUrl: require('../../projects/configure/configureProject.modal.html'),
          controller: 'ConfigureProjectModalCtrl',
          controllerAs: 'ctrl',
          size: 'lg',
          resolve: {
            projectConfig: () => {
              return {};
            },
          },
        })
        .result.then(routeToProject)
        .catch(() => {});
    };

    function routeToProject(project) {
      $state.go('home.project.dashboard', {
        project: project.name,
      });
    }

    this.createApplicationForTests = () => {
      $uibModal
        .open({
          scope: $scope,
          templateUrl: overrideRegistry.getTemplate(
            'createApplicationModal',
            require('../../application/modal/newapplication.html'),
          ),
          controller: overrideRegistry.getController('CreateApplicationModalCtrl'),
          controllerAs: 'newAppModal',
        })
        .result.then(routeToApplication)
        .catch(() => {});
    };

    function routeToApplication(app) {
      $state.go('home.applications.application.insight.clusters', {
        application: app.name,
      });
    }

    let refreshMenuItem = {
      displayName: 'Refresh all caches',
      disableAutoClose: true,
    };

    refreshMenuItem.action = status => {
      let originalDisplayName = refreshMenuItem.displayName;
      refreshMenuItem.displayName = '<span class="fa fa-sync-alt fa-spin"></span> Refreshing...';
      cacheInitializer.refreshCaches().then(() => {
        refreshMenuItem.displayName = originalDisplayName;
        status.isOpen = false;
      });
    };

    this.menuActions = [
      {
        displayName: 'Create Application',
        action: this.createApplicationForTests,
      },
      {
        displayName: 'Create Project',
        action: this.createProject,
      },
      refreshMenuItem,
    ];

    this.hasResults = () => {
      return $scope.categories.length || $scope.projects.length;
    };

    this.noMatches = () => !this.hasResults() && $scope.query && $scope.query.length > 0;

    this.showRecentResults = () =>
      !$scope.viewState.searching &&
      !$scope.projects.length &&
      $scope.categories.every(category => !category.results.length);
  })
  .directive('infrastructureSearchV1', function() {
    return {
      restrict: 'E',
      templateUrl: require('./infrastructure.html'),
      controller: 'InfrastructureCtrl',
      controllerAs: 'ctrl',
    };
  });
