'use strict';

import _ from 'lodash';

let angular = require('angular');

module.exports = angular
  .module('spinnaker.fastProperty.scopeBuilder.service', [
    require('../fastProperty.read.service'),
    require('core/application/listExtractor/listExtractor.service'),
    require('core/application/service/applications.read.service.js'),
    require('core/config/settings.js'),
  ])
  .factory('fastPropertyScopeBuilderService', (appListExtractorService, applicationReader, settings, fastPropertyReader) => {

    let isSkip = (prop) => prop && prop === 'none';

    let objectValuesToList = (object) => {
      return Object.keys(object).map((key) => object[key]);
    };

    let ifNotInListDo = (list, property, fn) => {
      if(!_.includes(list, property)) {
        fn();
      }
    };

    let getDeleter = (scopeHolder, propertyName) => {
      return function deleter() {
        if (!isSkip(scopeHolder[propertyName])) {
          delete scopeHolder[propertyName];
        }
        return scopeHolder;
      };
    };

    /*
     * FILTERS
     */

    let createClusterFilter = (scopeHolder) => {
      return (cluster) => {
        return isSkip(scopeHolder.cluster) || cluster.name === scopeHolder.cluster;
      };
    };

    let createServerGroupFilter = (scopeHolder) => {
      return (serverGroup) => {
        return isSkip(scopeHolder.asg) || serverGroup.name === scopeHolder.asg;
      };
    };

    let createAvailabilityZoneFilter = (scopeHolder) => {
      return (instance) => {
        return isSkip(scopeHolder.zone) || instance.availabilityZone === scopeHolder.zone;
      };
    };

    let createRegionFilter = (scopeHolder) => {
      return (serverGroup) => {
        return isSkip(scopeHolder.region) || serverGroup.region === scopeHolder.region;
      };
    };

    let createClusterHasStackFilter = (scopeHolder) => {
      return (cluster) => {
        return isSkip(scopeHolder.stack) || _.some(cluster.serverGroups, {stack: scopeHolder.stack});
      };
    };


    /*
     * Function factories
     */

    let createApplicationSelectedFn = (ctrl, applicationChangeFn, isSingleApp = false) => {
      return (appName) => {
        applicationReader
          .getApplication(appName)
          .then( (application) => {
            return application.ready()
              .then(() => {
                if(isSingleApp) {
                  ctrl.chosenApps = {};
                }
                ctrl.chosenApps[appName] = application;
                return ctrl.chosenApps;
              });
          })
          .finally( () => {
            applicationChangeFn();
          });
      };
    };

    let createGetRegionsFn = (ctrl, scopeHolder, listHolder, regionChangeFn) => {
      return () => {
        if(ctrl.chosenApps) {
          const valueList = objectValuesToList(ctrl.chosenApps);
          listHolder.region = appListExtractorService.getRegions(valueList).sort();
        } else {
          let preferredZoneList = settings.providers.aws.preferredZonesByAccount[ctrl.property.env];
          listHolder.region = preferredZoneList ? Object.keys(preferredZoneList) : [];
        }

        let deleteRegion = getDeleter(scopeHolder, 'region');
        ifNotInListDo(listHolder.region, scopeHolder.region, deleteRegion);

        regionChangeFn(scopeHolder.region);
      };
    };

    let createApplicationChangeFn = (scopeHolder, getRegionsFn) => {
      return () => {
        getRegionsFn();
        if (_.isEmpty(scopeHolder.appId)) {
          delete scopeHolder.appId;
        }
      };
    };

    let createRegionChangeFn = (ctrl, scopeHolder, listHolder, stackChangeFn) => {
      return (region = '') => {
        scopeHolder.region = region;
        const valueList = objectValuesToList(ctrl.chosenApps);

        let regionFilter = createRegionFilter(scopeHolder);
        listHolder.stack = appListExtractorService.getStacks(valueList, regionFilter);

        let deleteStack = getDeleter(scopeHolder, 'stack');
        ifNotInListDo(listHolder.stack, scopeHolder.stack, deleteStack);

        stackChangeFn(scopeHolder.stack);
      };
    };

    let createStackChangeFn = (ctrl, scopeHolder, listHolder, clusterChangeFn) => {
      return (stack = '') => {
        scopeHolder.stack = stack;
        const valueList = objectValuesToList(ctrl.chosenApps);

        let clusterHasStackFilter = createClusterHasStackFilter(scopeHolder);
        listHolder.cluster = appListExtractorService.getClusters(valueList, clusterHasStackFilter);

        let deleteCluster = getDeleter(scopeHolder, 'cluster');
        ifNotInListDo(listHolder.cluster, scopeHolder.cluster, deleteCluster);

        clusterChangeFn(scopeHolder.cluster);
      };
    };

    let createStackChangeWithoutDeleteFn = (ctrl, scopeHolder, listHolder, clusterChangeFn) => {
      return (stack = '') => {
        scopeHolder.stack = stack;
        const valueList = objectValuesToList(ctrl.chosenApps);

        let clusterHasStackFilter = createClusterHasStackFilter(scopeHolder);
        listHolder.cluster = appListExtractorService.getClusters(valueList, clusterHasStackFilter);

        //let deleteCluster = getDeleter(scopeHolder, 'cluster');
        //ifNotInListDo(listHolder.cluster, scopeHolder.cluster, deleteCluster);

        clusterChangeFn(scopeHolder.cluster);
      };
    };

    let createClusterChangeFn = (ctrl, scopeHolder, listHolder, asgChangeFn) => {
      return (cluster = '') => {
        scopeHolder.cluster = cluster;
        const valueList = objectValuesToList(ctrl.chosenApps);

        let clusterFilter = createClusterFilter(scopeHolder);
        listHolder.asg = appListExtractorService.getAsgs(valueList, clusterFilter);

        let deleteAsg = getDeleter(scopeHolder, 'asg');
        ifNotInListDo(listHolder.asg, scopeHolder.asg, deleteAsg);

        asgChangeFn(scopeHolder.asg);
      };
    };

    let createClusterChangeWithoutDeleteFn = (ctrl, scopeHolder, listHolder, asgChangeFn) => {
      return (cluster = '') => {
        scopeHolder.cluster = cluster;
        const valueList = objectValuesToList(ctrl.chosenApps);

        let clusterFilter = createClusterFilter(scopeHolder);
        listHolder.asg = appListExtractorService.getAsgs(valueList, clusterFilter);

        asgChangeFn(scopeHolder.asg);
      };
    };

    let createAsgChangeFn = (ctrl, scopeHolder, listHolder, availabilityZoneChangeFn) => {
      return (asg = '') => {
        scopeHolder.asg = asg;
        const valueList = objectValuesToList(ctrl.chosenApps);
        let clusterFilter = createClusterFilter(scopeHolder);
        let serverGroupFilter = createServerGroupFilter(scopeHolder);
        let regionFilter = createRegionFilter(scopeHolder);
        listHolder.zone = appListExtractorService.getZones(valueList, clusterFilter, regionFilter, serverGroupFilter);

        let deleteZone = getDeleter(scopeHolder, 'zone');
        ifNotInListDo(listHolder.zone, scopeHolder.zone, deleteZone);

        availabilityZoneChangeFn(scopeHolder.zone);
      };
    };

    let createAvailabilityZoneChangeFn = (ctrl, scopeHolder, listHolder, instanceChangeFn) => {
      return (zone = '') => {
        scopeHolder.zone = zone;

        const valueList = objectValuesToList(ctrl.chosenApps);

        let clusterFilter = createClusterFilter(scopeHolder);
        let serverGroupFilter = createServerGroupFilter(scopeHolder);
        let availabilityZoneFilter = createAvailabilityZoneFilter(scopeHolder);
        listHolder.instance = appListExtractorService.getInstances(valueList, clusterFilter, serverGroupFilter, availabilityZoneFilter);

        let deleteInstance = getDeleter(scopeHolder, 'serverId');
        ifNotInListDo(_.map(listHolder.instance, 'id'), scopeHolder.serverId, deleteInstance);

        instanceChangeFn(scopeHolder.serverId);
      };
    };

    let createInstanceChangeFn = (scopeHolder, nextFn) => {
      return (instance = '') => {
        scopeHolder.serverId = instance;
        nextFn();
      };
    };

    let prepareScopeForEnvironment = (propertyScope, env) => {
      let selectedScope = _.chain(propertyScope)
        .omit(isSkip)
        .transform((result, value, key) => {
          if(key === 'appIdList') {
            result.appId = angular.isArray(value) ? value.join(',') : value;
          } else {
            result[key] = value;
          }
          result.env = env;
        })
        .value();

      return selectedScope;
    };

    let transformScope = (fpScope, env) => {
      return _.chain(fpScope)
        .omit(isSkip)
        .transform((result, value, key) => {
          if(key === 'appIdList') {
            result.appId = value.join(',');
            result[key] = value;
          } else {
            result[key] = value;
          }
          result.env = env;
        })
        .value();

    };

    let getImpact = (targetScope, env) => {
      let fastPropertyScope = prepareScopeForEnvironment(targetScope, env);
      return fastPropertyReader.fetchImpactCountForScope(fastPropertyScope)
        .then((impact) => {
          return impact.count;
        });
    };

    return {
      createApplicationSelectedFn: createApplicationSelectedFn,
      createStackChangeWithoutDeleteFn: createStackChangeWithoutDeleteFn,
      createGetRegionsFn: createGetRegionsFn,
      createApplicationChangeFn: createApplicationChangeFn,
      createRegionChangeFn: createRegionChangeFn,
      createStackChangeFn: createStackChangeFn,
      createClusterChangeFn: createClusterChangeFn,
      createClusterChangeWithoutDeleteFn: createClusterChangeWithoutDeleteFn,
      createAsgChangeFn: createAsgChangeFn,
      createAvailabilityZoneChangeFn: createAvailabilityZoneChangeFn,
      createInstanceChangeFn: createInstanceChangeFn,
      objectValuesToList: objectValuesToList,
      isSkip: isSkip,
      transformScope: transformScope,
      getImpact: getImpact,
    };
  });
