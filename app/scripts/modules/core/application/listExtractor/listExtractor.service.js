'use strict';

let angular = require('angular');

module.exports = angular
  .module('spinnaker.application.listExtractor.service', [
    require('../../utils/lodash.js')
  ])
  .factory('appListExtractorService', function(_) {

    let defaultAccountFilter = (/*cluster*/) => true;

    let getRegions = (appList, accountFilter = defaultAccountFilter) => {
      return _(appList)
        .map('clusters').flatten()
        .filter(accountFilter)
        .map('serverGroups').flatten()
        .map('region')
        .compact()
        .unique()
        .value();
    };

    let defaultRegionFilter = (/*serverGroup*/) => true;

    let getStacks = (appList, regionFilter = defaultRegionFilter) => {
      return _(appList)
        .map('clusters').flatten()
        .map('serverGroups').flatten()
        .filter( regionFilter )
        .map('stack').flatten()
        .compact()
        .unique()
        .value()
        .sort();
    };

    let defaultClusterFilter = (/*cluster*/) => true;

    let clusterFilterForCredentialsAndRegion = (credentials, region) => {
      return (cluster) => {
        let acctFilter = credentials ? cluster.account === credentials : true;

        let regionFilter = Array.isArray(region) && region.length
          ? _.some( cluster.serverGroups, (sg) => _.some(region, (region) => region === sg.region))
          : _.isString(region) //region is just a string not an array
          ? _.any(cluster.serverGroups, (sg) => sg.region === region)
          : true;

        return acctFilter && regionFilter;
      };
    };

    let getClusters = (appList, clusterFilter = defaultClusterFilter) => {
      return _(appList)
        .map('clusters').flatten()
        .filter(clusterFilter)
        .map('name').flatten()
        .compact()
        .unique()
        .value()
        .sort();
    };


    let getAsgs = (appList, clusterFilter = defaultClusterFilter) => {
      return _(appList)
        .map('clusters').flatten()
        .filter(clusterFilter)
        .map('serverGroups').flatten()
        .map('name')
        .compact()
        .unique()
        .value()
        .sort()
        .reverse();
    };

    let defaultServerGroupFilter = (/*serverGroup*/) => true;

    let getZones = (appList, clusterFilter = defaultClusterFilter, regionFilter = defaultRegionFilter, serverGroupFilter = defaultServerGroupFilter) => {
      return _(appList)
        .map('clusters').flatten()
        .filter( clusterFilter )
        .map('serverGroups').flatten()
        .filter( regionFilter )
        .filter( serverGroupFilter )
        .map('instances').flatten()
        .map('availabilityZone').flatten()
        .compact()
        .unique()
        .value();
    };

    let defaultAvailabilityZoneFilter = (/*instance*/) => true;

    let getInstances = (appList, clusterFilter = defaultClusterFilter, serverGroupFilter = defaultServerGroupFilter, availabilityZoneFilter = defaultAvailabilityZoneFilter) => {
      return _(appList)
        .map('clusters').flatten()
        .filter(clusterFilter)
        .map('serverGroups').flatten()
        .filter( serverGroupFilter )
        .map('instances').flatten()
        .filter( availabilityZoneFilter )
        .compact()
        .unique()
        .value();
    };

    return {
      getRegions: getRegions,
      getStacks: getStacks,
      getClusters: getClusters,
      clusterFilterForCredentialsAndRegion: clusterFilterForCredentialsAndRegion,
      getAsgs: getAsgs,
      getZones: getZones,
      getInstances: getInstances,
    };

  });
