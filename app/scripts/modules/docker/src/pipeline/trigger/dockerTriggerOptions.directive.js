'use strict';

const angular = require('angular');
import { Observable, Subject } from 'rxjs';

import { DockerImageReader } from 'docker/image/DockerImageReader';

module.exports = angular
  .module('spinnaker.docker.pipeline.config.triggers.options.directive', [])
  .directive('dockerTriggerOptions', function() {
    return {
      restrict: 'E',
      templateUrl: require('./dockerTriggerOptions.directive.html'),
      bindToController: {
        command: '=',
      },
      controller: 'dockerTriggerOptionsCtrl',
      controllerAs: 'vm',
      scope: {},
    };
  })
  .controller('dockerTriggerOptionsCtrl', function($scope) {
    // These fields will be added to the trigger when the form is submitted
    this.command.extraFields = {};

    this.viewState = {
      tagsLoading: true,
      loadError: false,
      selectedTag: null,
    };

    let tagLoadSuccess = tags => {
      this.tags = tags;
      if (this.tags.length) {
        // default to what is supplied by the trigger if possible; otherwise, use the latest
        let defaultSelection = this.tags.find(t => t === this.command.trigger.tag) || this.tags[0];
        this.viewState.selectedTag = defaultSelection;
        this.updateSelectedTag(defaultSelection);
      }
      this.viewState.tagsLoading = false;
    };

    let tagLoadFailure = () => {
      this.viewState.tagsLoading = false;
      this.viewState.loadError = true;
    };

    let initialize = () => {
      // cancel search stream if trigger has changed to some other type
      if (this.command.trigger.type !== 'docker') {
        subscription.unsubscribe();
        return;
      }
      this.searchTags();
    };

    let handleQuery = () => {
      return Observable.fromPromise(
        DockerImageReader.findTags({
          provider: 'dockerRegistry',
          account: this.command.trigger.account,
          repository: this.command.trigger.repository,
        }),
      );
    };

    this.updateSelectedTag = tag => {
      this.command.extraFields.tag = tag;

      if (this.command.trigger && this.command.trigger.repository) {
        let imageName = '';
        if (this.command.trigger.registry) {
          imageName += this.command.trigger.registry + '/';
        }
        imageName += this.command.trigger.repository;
        this.command.extraFields.artifacts = [
          {
            type: 'docker/image',
            name: imageName,
            version: tag,
            reference: imageName + ':' + tag,
          },
        ];
      }
    };

    let queryStream = new Subject();

    let subscription = queryStream
      .debounceTime(250)
      .switchMap(handleQuery)
      .subscribe(tagLoadSuccess, tagLoadFailure);

    this.searchTags = (query = '') => {
      this.tags = [`<span>Finding tags${query && ` matching ${query}`}...</span>`];
      queryStream.next();
    };

    $scope.$watch(() => this.command.trigger, initialize);
  });
