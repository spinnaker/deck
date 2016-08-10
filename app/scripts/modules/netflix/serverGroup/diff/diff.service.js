'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.core.diff.service', [
  require('../../../core/api/api.service'),
  require('../../../core/utils/lodash.js'),
  require('../../../core/config/settings.js'),
])
  .factory('diffService', function (_, API, $q, settings) {

    // TODO: Consider removing entirely after 11/08/16 if nobody asks about the feature being turned off
    function getClusterDiffForAccount(accountName, clusterName) {
      if (!settings.feature.clusterDiff) {
        return $q.when({});
      }
      return API
        .all('diff')
        .all('cluster')
        .one(accountName, clusterName)
        .get().then(
          (diff) => {
            return diff;
          },
          () => {
            return {};
          }
      );
    }

    function diffSecurityGroups(securityGroups, clusterDiff, source) {
      if (!clusterDiff) {
        return [];
      }
      return _(clusterDiff.attributeGroups)
        .map((attributeGroup) => {
          return {
            commonSecurityGroups: attributeGroup.commonAttributes.securityGroups,
            serverGroups: attributeGroup.identifiers
          };
        })
        .filter((attributeGroup) => {
          return attributeGroup.commonSecurityGroups && !_.isEqual(attributeGroup.commonSecurityGroups.sort(),
              securityGroups.sort());
        })
        .map((attributeGroup) => {
          return {
            commonSecurityGroups: attributeGroup.commonSecurityGroups,
            serverGroups: _(attributeGroup.serverGroups)
              .pluck('location')
              .merge(_(attributeGroup.serverGroups).pluck('identity').value())
              .filter((serverGroup) => {
                if (source) {
                  var serverGroupIdentity = {
                    account: serverGroup.account,
                    region: serverGroup.region,
                    asgName: serverGroup.autoScalingGroupName,
                  };
                  return !_.isEqual(serverGroupIdentity, source);
                }
                return true;
              })
              .sortByAll('account', 'region', 'autoScalingGroupName')
              .value()
          };
        })
        .filter((attributeGroup) => {
          return attributeGroup.serverGroups.length;
        })
        .value();
    }

    return {
      getClusterDiffForAccount: getClusterDiffForAccount,
      diffSecurityGroups: diffSecurityGroups,
    };
  });
