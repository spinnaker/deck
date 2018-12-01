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

    let loadAndSelectRegions = (command, backingData) => {
      if (command.account) {
        let selectedAccountDetails = backingData.credentialsKeyedByAccount[command.account];
        if (!selectedAccountDetails) {
          return;
        }
        backingData.filtered.regions = _.map(selectedAccountDetails.regions, region => {
          return { name: region.name };
        });
        if (selectedAccountDetails) {
          command.region = selectedAccountDetails.region;
        }
      }
    };

    let loadAvailabilityDomains = command => {
      if (command.account && command.region) {
        AccountService.getAvailabilityZonesForAccountAndRegion(oracle, command.account, command.region).then(
          availDoms => {
            if (availDoms) {
              command.backingData.filtered.availabilityDomains = availDoms.map(av => {
                return { name: av };
              });
            } else {
              command.backingData.filtered.availabilityDomains = [];
              command.availabilityDomain = null;
            }
          },
        );
      }
    };

    let loadLoadBalancers = command => {
      if (command.account && command.region) {
        command.backingData.filtered.loadBalancers = command.backingData.loadBalancers.filter(function(lb) {
          return lb.region === command.region && lb.account === command.account;
        });
      }
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
          loadAndSelectRegions(command, backingData);
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

          backingData.loadBalancers = application.loadBalancers.data;

          backingData.accountOnChange = function() {
            loadAndSelectRegions(command, command.backingData);
            loadAvailabilityDomains(command);
            loadLoadBalancers(command);
          };

          backingData.regionOnChange = function() {
            loadAvailabilityDomains(command);
            loadLoadBalancers(command);
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

          backingData.findBackendSetsByLoadBalancerId = loadBalancerId => {
            const lb = backingData.filtered.loadBalancers.find(lb => lb.id === loadBalancerId);
            if (lb && lb.backendSets) {
              //reduce the backendSets object to an array. The object is keyed by the backendSet name
              const bsetArray = [];
              Object.keys(lb.backendSets).reduce((arr, bsetName) => {
                const bset = lb.backendSets[bsetName];
                bset['name'] = bsetName;
                arr.push(bset);
                return arr;
              }, bsetArray);
              return bsetArray;
            } else {
              return [];
            }
          };

          backingData.findLoadBalListenersByBackendSetName = (loadBalancerId, backendSetName) => {
            const lb = backingData.filtered.loadBalancers.find(lb => lb.id === loadBalancerId);
            if (lb && lb.listeners) {
              return Object.keys(lb.listeners)
                .filter(lisName => lb.listeners[lisName].defaultBackendSetName === backendSetName)
                .map(lisName => lb.listeners[lisName]);
            } else {
              return [];
            }
          };

          backingData.loadBalancerOnChange = () => {
            if (command.loadBalancerId) {
              backingData.filtered.backendSets = backingData.findBackendSetsByLoadBalancerId(command.loadBalancerId);
            } else {
              //no backend set name should be set if no load balancer id is set
              command.backendSetName = undefined;
              backingData.backendSetOnChange();
              backingData.filtered.backendSets = [];
            }
          };

          backingData.backendSetOnChange = () => {
            backingData.filtered.listeners =
              command.loadBalancerId && command.backendSetName
                ? backingData.findLoadBalListenersByBackendSetName(command.loadBalancerId, command.backendSetName)
                : [];
          };

          backingData.filtered.images = backingData.images;
          let shapesMap = {};
          _.forEach(backingData.filtered.images, image => {
            shapesMap[image.id] = getShapes(image);
          });
          backingData.filtered.shapes = shapesMap;
          backingData.filtered.allShapes = _.uniqBy(_.flatten(_.values(shapesMap)), 'name');
          command.backingData = backingData;
          if (command.account) {
            loadLoadBalancers(command);
            backingData.loadBalancerOnChange();
            backingData.backendSetOnChange();
          }
        });
    }

    function loadImages() {
      return oracleImageReader.findImages({ provider: oracle });
    }

    return {
      configureCommand: configureCommand,
    };
  });
