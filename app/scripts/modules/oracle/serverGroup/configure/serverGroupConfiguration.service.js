'use strict';

const angular = require('angular');
import _ from 'lodash';

import { AccountService, NetworkReader, SECURITY_GROUP_READER, SubnetReader } from '@spinnaker/core';
import { OracleProviderSettings } from '../../oracle.settings';

module.exports = angular
  .module('spinnaker.oracle.serverGroup.configure.configuration.service', [SECURITY_GROUP_READER])
  .factory('oracleServerGroupConfigurationService', function($q, oracleImageReader, securityGroupReader) {
    let oracle = 'oracle';

    let getShapes = image => {
      if (!image || !image.compatibleShapes) {
        return [];
      }
      return image.compatibleShapes.map(shape => {
        return { name: shape };
      });
    };

    function configureCommand(application, command) {
      let defaults = command || {};
      let defaultCredentials =
        defaults.account || application.defaultCredentials.oracle || OracleProviderSettings.defaults.account;
      let defaultRegion =
        defaults.region || application.defaultRegions.oracle || OracleProviderSettings.defaults.region;

      return $q
        .all({
          credentialsKeyedByAccount: AccountService.getCredentialsKeyedByAccount(oracle),
          networks: NetworkReader.listNetworksByProvider(oracle),
          subnets: SubnetReader.listSubnetsByProvider(oracle),
          securityGroups: securityGroupReader.getAllSecurityGroups(),
          images: loadImages(),
          availDomains: AccountService.getAvailabilityZonesForAccountAndRegion(
            oracle,
            defaultCredentials,
            defaultRegion,
          ),
        })
        .then(function(backingData) {
          backingData.accounts = _.keys(backingData.credentialsKeyedByAccount);
          backingData.filtered = {};
          backingData.filtered.regions = [{ name: 'us-phoenix-1' }];
          backingData.filtered.availabilityDomains = _.map(backingData.availDomains, function(zone) {
            return { name: zone };
          });

          backingData.filterSubnets = function() {
            if (command.vpcId && command.availabilityDomain) {
              return _.filter(backingData.subnets, {
                vcnId: command.vpcId,
                availabilityDomain: command.availabilityDomain,
              });
            }
            return backingData.subnets;
          };

          backingData.availabilityDomainOnChange = function() {
            command.subnetId = null;
            backingData.seclists = null;
          };

          backingData.vpcOnChange = function() {
            command.subnetId = null;
            backingData.seclists = null;
          };

          backingData.subnetOnChange = function() {
            let subnet = _.find(backingData.subnets, { id: command.subnetId });
            let mySecGroups = backingData.securityGroups[command.account][oracle][command.region];
            let secLists = [];
            _.forEach(subnet.securityListIds, function(sid) {
              let sgRef = _.find(mySecGroups, { id: sid });
              securityGroupReader
                .getSecurityGroupDetails(
                  command.application,
                  command.account,
                  oracle,
                  command.region,
                  command.vpcId,
                  sgRef.name,
                )
                .then(function(sgd) {
                  secLists.push(sgd);
                  backingData.seclists = secLists;
                });
            });
          };

          backingData.filtered.images = backingData.images;
          let shapesMap = {};
          _.forEach(backingData.filtered.images, image => {
            shapesMap[image.id] = getShapes(image);
          });
          backingData.filtered.shapes = shapesMap;
          backingData.filtered.allShapes = _.uniqBy(_.flatten(shapesMap), 'name');
          command.backingData = backingData;
        });
    }

    function loadImages() {
      return oracleImageReader.findImages({ provider: oracle });
    }

    return {
      configureCommand: configureCommand,
    };
  });
