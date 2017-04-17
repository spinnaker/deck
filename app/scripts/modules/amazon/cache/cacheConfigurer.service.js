'use strict';

let angular = require('angular');

import {ACCOUNT_SERVICE} from 'core/account/account.service';
import {INSTANCE_TYPE_SERVICE} from 'core/instance/instanceType.service';
import {LOAD_BALANCER_READ_SERVICE} from 'core/loadBalancer/loadBalancer.read.service';
import {SUBNET_READ_SERVICE} from 'core/subnet/subnet.read.service';

module.exports = angular.module('spinnaker.aws.cache.initializer', [
  ACCOUNT_SERVICE,
  LOAD_BALANCER_READ_SERVICE,
  INSTANCE_TYPE_SERVICE,
  SUBNET_READ_SERVICE,
  require('../vpc/vpc.read.service.js'),
])
  .factory('awsCacheConfigurer', function ($q,
                                         accountService, instanceTypeService,
                                         subnetReader, vpcReader, loadBalancerReader) {

    let config = Object.create(null);

    config.credentials = {
      initializers: [ () => accountService.listAccounts('aws') ],
    };

    config.instanceTypes = {
      initializers: [ () => instanceTypeService.getAllTypesByRegion('aws') ],
    };

    config.loadBalancers = {
      initializers: [ () => loadBalancerReader.listLoadBalancers('aws') ],
    };

    config.subnets = {
      version: 2,
      initializers: [() => subnetReader.listSubnets() ],
    };

    config.networks = {
      version: 2,
      initializers: [vpcReader.listVpcs],
      onReset: [vpcReader.resetCache],
    };

    return config;
  });
