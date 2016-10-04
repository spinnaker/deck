'use strict';
import anyFieldFilter from '../presentation/anyFieldFilter/anyField.filter';
let angular = require('angular');


module.exports = angular.module('spinnaker.projects.controller', [
  require('angular-ui-router'),
  require('./service/project.write.service.js'),
  require('./service/project.read.service.js'),
  require('../account/account.service.js'),
  anyFieldFilter,
  require('../cache/viewStateCache.js'),
  require('../presentation/sortToggle/sorttoggle.directive.js'),
  require('../insight/insightmenu.directive.js'),
])
  .controller('ProjectsCtrl', function($scope, $uibModal, $log, $filter,
                                           $state, projectWriter, projectReader, viewStateCache) {

    var projectsViewStateCache = viewStateCache.projects || viewStateCache.createCache('projects', { version: 1 });

    function cacheViewState() {
      projectsViewStateCache.put('#global', $scope.viewState);
    }

    function initializeViewState() {
      $scope.viewState = projectsViewStateCache.get('#global') || {
          sortModel: { key: 'name' },
          projectFilter: '',
        };
    }

    $scope.projectsLoaded = false;

    $scope.projectFilter = '';

    $scope.menuActions = [
      {
        displayName: 'Create Project',
        action: function() {
          $uibModal.open({
            scope: $scope,
            templateUrl: require('./configure/configureProject.modal.html'),
            controller: 'ConfigureProjectModalCtrl',
            controllerAs: 'ctrl',
            size: 'lg',
            resolve: {
              projectConfig: () => { return {}; },
            }
          }).result.then(routeToProject);
        }
      }
    ];

    function routeToProject(project) {
      $state.go(
        'home.project.dashboard', {
          project: project.name,
        }
      );
    }

    this.filterProjects = function filterProjects() {
      var filtered = $filter('anyFieldFilter')($scope.projects, {name: $scope.viewState.projectFilter, email: $scope.viewState.projectFilter}),
        sorted = $filter('orderBy')(filtered, $scope.viewState.sortModel.key);
      $scope.filteredProjects = sorted;
      this.resetPaginator();
    };

    this.resultPage = function resultPage() {
      var pagination = $scope.pagination,
        allFiltered = $scope.filteredProjects,
        start = (pagination.currentPage - 1) * pagination.itemsPerPage,
        end = pagination.currentPage * pagination.itemsPerPage;
      if (!allFiltered || !allFiltered.length) {
        return [];
      }
      if (allFiltered.length < pagination.itemsPerPage) {
        return allFiltered;
      }
      if (allFiltered.length < end) {
        return allFiltered.slice(start);
      }
      return allFiltered.slice(start, end);
    };

    this.resetPaginator = function resetPaginator() {
      $scope.pagination = {
        currentPage: 1,
        itemsPerPage: 12,
        maxSize: 12
      };
    };

    var ctrl = this;

    projectReader.listProjects().then(function(projects) {
      $scope.projects = projects;
      ctrl.filterProjects();
      $scope.projectsLoaded = true;
    });

    $scope.$watch('viewState', cacheViewState, true);

    initializeViewState();

  }
);
