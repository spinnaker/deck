'use strict';

import _ from 'lodash';

let angular = require('angular');

module.exports = angular.module('spinnaker.deck.core.securityGroup.dependentFilterHelper.service', [])
  .factory('securityGroupDependentFilterHelper', function () {
    let poolValueCoordinates = [
      { filterField: 'providerType', on: 'securityGroup', localField: 'provider' },
      { filterField: 'account', on: 'securityGroup', localField: 'account' },
      { filterField: 'region', on: 'securityGroup', localField: 'region' },
    ];

    function poolBuilder (securityGroups) {
      let pool = securityGroups
        .map((sg) => {
          let poolUnit = _.chain(poolValueCoordinates)
            .filter({ on: 'securityGroup' })
            .reduce((poolUnitTemplate, coordinate) => {
              poolUnitTemplate[coordinate.filterField] = sg[coordinate.localField];
              return poolUnitTemplate;
            }, {})
            .value();

          return poolUnit;
        });

      return pool;
    }

    return { poolBuilder };
  });
