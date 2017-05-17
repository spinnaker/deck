'use strict';
const angular = require('angular');

import {DataSourceConfig} from '../application/service/applicationDataSource';
import {APPLICATION_DATA_SOURCE_REGISTRY} from '../application/service/applicationDataSource.registry';
import {SECURITY_GROUP_READER} from 'core/securityGroup/securityGroupReader.service';

module.exports = angular
  .module('spinnaker.core.securityGroup.dataSource', [
    APPLICATION_DATA_SOURCE_REGISTRY,
    SECURITY_GROUP_READER
  ])
  .run(function($q, applicationDataSourceRegistry, securityGroupReader) {

    let loadSecurityGroups = (application) => {
      return securityGroupReader.loadSecurityGroupsByApplicationName(application.name);
    };

    let addSecurityGroups = (application, securityGroups) => {
      return securityGroupReader.getApplicationSecurityGroups(application, securityGroups);
    };

    applicationDataSourceRegistry.registerDataSource(new DataSourceConfig({
      key: 'securityGroups',
      optional: true,
      loader: loadSecurityGroups,
      onLoad: addSecurityGroups,
      providerField: 'provider',
      credentialsField: 'accountName',
      regionField: 'region',
      description: 'Network traffic access management'
    }));
  });
