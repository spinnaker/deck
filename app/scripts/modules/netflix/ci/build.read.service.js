'use strict';

let angular = require('angular');

module.exports = angular
  .module('spinnaker.netflix.ci.build.read.service', [
    require('../../core/api/api.service'),
    require('../../core/config/settings'),
    require('../../core/orchestratedItem/orchestratedItem.transformer'),
  ])
  .factory('buildService', function (API, settings, orchestratedItemTransformer) {

    function transformBuild(build) {
      build.startTime = build.startedAt;
      build.endTime = build.completedAt;
      orchestratedItemTransformer.addRunningTime(build);
    }

    function getBuilds(repoType, projectKey, repoSlug, filter) {
      return builds().get({repoType: repoType, projectKey: projectKey, repoSlug: repoSlug, filter: filter}).then((response) => {
        response.data.forEach(transformBuild);
        return response.data;
      });
    }

    function getBuildDetails(buildId) {
      return builds().one(buildId).get().then((response) => {
        transformBuild(response);
        return response;
      });
    }

    function getBuildOutput(buildId) {
      return builds().one(buildId).one('output').get({start: -1, limit: 4096});
    }

    function getBuildConfig(buildId) {
      return builds().one(buildId).one('config').get();
    }

    function getBuildRawLogLink(buildId) {
      return [settings.gateUrl, 'ci', 'builds', buildId, 'rawOutput'].join('/');
    }

    function builds() {
      return API.all('ci').all('builds');
    }

    return {
      getBuilds: getBuilds,
      getBuildDetails: getBuildDetails,
      getBuildOutput: getBuildOutput,
      getBuildConfig: getBuildConfig,
      getBuildRawLogLink: getBuildRawLogLink,
    };
  });
