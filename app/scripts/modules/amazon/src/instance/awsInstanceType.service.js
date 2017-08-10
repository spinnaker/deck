'use strict';

const angular = require('angular');
import _ from 'lodash';

import { API_SERVICE, INFRASTRUCTURE_CACHE_SERVICE } from '@spinnaker/core';

module.exports = angular.module('spinnaker.amazon.instanceType.service', [
  API_SERVICE,
  INFRASTRUCTURE_CACHE_SERVICE
])
  .factory('awsInstanceTypeService', function ($http, $q, API, infrastructureCaches) {

    var m4 = {
      type: 'm4',
      description: 'This family includes the m4 instance types and provides a balance of compute, memory, and network resources, and it is a good choice for many applications.',
      instanceTypes: [
        {
          name: 'm4.large',
          label: 'Large',
          cpu: 2,
          memory: 8,
          storage: { type: 'EBS' },
          costFactor: 1
        },
        {
          name: 'm4.xlarge',
          label: 'XLarge',
          cpu: 4,
          memory: 16,
          storage: { type: 'EBS' },
          costFactor: 2
        },
        {
          name: 'm4.2xlarge',
          label: '2XLarge',
          cpu: 8,
          memory: 32,
          storage: { type: 'EBS' },
          costFactor: 2
        }
      ]
    };

    var t2gp = {
      type: 't2',
      description: 't2 instances are a good choice for workloads that don’t use the full CPU often or consistently, but occasionally need to burst (e.g. web servers, developer environments and small databases).',
      instanceTypes: [
        {
          name: 't2.small',
          label: 'Small',
          cpu: 1,
          memory: 2,
          storage: { type: 'EBS' },
          costFactor: 1
        },
        {
          name: 't2.medium',
          label: 'Medium',
          cpu: 2,
          memory: 4,
          storage: { type: 'EBS' },
          costFactor: 1
        }
      ]
    };

    var t2 = {
      type: 't2',
      description: 't2 instances are a good choice for workloads that don’t use the full CPU often or consistently, but occasionally need to burst (e.g. web servers, developer environments and small databases).',
      instanceTypes: [
        {
          name: 't2.nano',
          label: 'Nano',
          cpu: 1,
          memory: 0.5,
          storage: { type: 'EBS' },
          costFactor: 1
        },
        {
          name: 't2.micro',
          label: 'Micro',
          cpu: 1,
          memory: 1,
          storage: { type: 'EBS' },
          costFactor: 1
        },
        {
          name: 't2.small',
          label: 'Small',
          cpu: 1,
          memory: 2,
          storage: { type: 'EBS' },
          costFactor: 1
        }
      ]
    };


    var r4 = {
      type: 'r4',
      description: 'r4 instances are optimized for memory-intensive applications and have the lowest cost per GiB of RAM among Amazon EC2 instance types.',
      instanceTypes: [
        {
          name: 'r4.large',
          label: 'Large',
          cpu: 2,
          memory: 15.25,
          storage: { type: 'EBS' },
          costFactor: 1
        },
        {
          name: 'r4.xlarge',
          label: 'XLarge',
          cpu: 4,
          memory: 30.5,
          storage: { type: 'EBS' },
          costFactor: 2
        },
        {
          name: 'r4.2xlarge',
          label: '2XLarge',
          cpu: 8,
          memory: 61,
          storage: { type: 'EBS' },
          costFactor: 2
        },
        {
          name: 'r4.4xlarge',
          label: '4XLarge',
          cpu: 16,
          memory: 122,
          storage: { type: 'EBS' },
          costFactor: 3
        }
      ]
    };

    var categories = [
      {
        type: 'general',
        label: 'General Purpose',
        families: [ m4, t2gp ],
        icon: 'hdd'
      },
      {
        type: 'memory',
        label: 'High Memory',
        families: [ r4 ],
        icon: 'hdd'
      },
      {
        type: 'micro',
        label: 'Micro Utility',
        families: [t2],
        icon: 'hdd'
      },
      {
        type: 'custom',
        label: 'Custom Type',
        families: [],
        icon: 'asterisk'
      }
    ];

    function getCategories() {
      return $q.when(categories);
    }

    var getAllTypesByRegion = function getAllTypesByRegion() {
      var cached = infrastructureCaches.get('instanceTypes').get('aws');
      if (cached) {
        return $q.when(cached);
      }
      return API.one('instanceTypes').get()
        .then(function (types) {
          var result = _.chain(types)
            .map(function (type) {
              return { region: type.region, account: type.account, name: type.name, key: [type.region, type.account, type.name].join(':') };
            })
            .uniqBy('key')
            .groupBy('region')
            .value();
          infrastructureCaches.get('instanceTypes').put('aws', result);
          return result;
        });
    };

    let instanceClassOrder = ['xlarge', 'large', 'medium', 'small', 'micro', 'nano'];

    function sortTypesByFamilyAndSize(o1, o2) {
      var type1 = o1.split('.'),
          type2 = o2.split('.');

      if (type1.length !== 2 || type2.length !== 2) {
        return 0;
      }

      let [family1, class1] = type1;
      let [family2, class2] = type2;

      if (family1 !== family2) {
        if (family1 > family2) {
          return 1;
        } else if (family1 < family2) {
          return -1;
        }
        return 0;
      }

      let t1Idx = instanceClassOrder.findIndex(el => class1.endsWith(el));
      let t2Idx = instanceClassOrder.findIndex(el => class2.endsWith(el));

      if (t1Idx === -1 || t2Idx === -1) {
        return 0;
      }

      if (t1Idx === 0 && t2Idx === 0) {
        let size1 = parseInt(class1.replace('xlarge', '')) || 0;
        let size2 = parseInt(class2.replace('xlarge', '')) || 0;

        if (size2 < size1) {
          return 1;
        } else if (size2 > size1) {
          return -1;
        }
        return 0;
      }

      if (t1Idx > t2Idx) {
        return -1;
      } else if (t1Idx < t2Idx) {
        return 1;
      }
      return 0;
    }

    function getAvailableTypesForRegions(availableRegions, selectedRegions) {
      selectedRegions = selectedRegions || [];
      var availableTypes = [];

      // prime the list of available types
      if (selectedRegions && selectedRegions.length) {
        availableTypes = _.map(availableRegions[selectedRegions[0]], 'name');
      }

      // this will perform an unnecessary intersection with the first region, which is fine
      selectedRegions.forEach(function(selectedRegion) {
        if (availableRegions[selectedRegion]) {
          availableTypes = _.intersection(availableTypes, _.map(availableRegions[selectedRegion], 'name'));
        }
      });

      return availableTypes.sort(sortTypesByFamilyAndSize);
    }

    let families = {
      paravirtual: ['c1', 'c3', 'hi1', 'hs1', 'm1', 'm2', 'm3', 't1'],
      hvm: ['c3', 'c4', 'd2', 'i2', 'g2', 'm3', 'm4', 'p2', 'r3', 't2', 'x1'],
      vpcOnly: ['c4', 'm4', 't2', 'x1'],
      ebsOptimized: ['c4', 'd2', 'f1', 'g3', 'i3', 'm4', 'p2', 'r4', 'x1'],
    };

    function filterInstanceTypes(instanceTypes, virtualizationType, vpcOnly) {
      return instanceTypes.filter((instanceType) => {
        if (virtualizationType === '*') {
          // show all instance types
          return true;
        }
        let [family] = instanceType.split('.');
        if (!vpcOnly && families.vpcOnly.includes(family)) {
          return false;
        }
        if (!families.paravirtual.includes(family) && virtualizationType === 'hvm') {
          return true;
        }
        return families[virtualizationType].includes(family);
      });
    }

    function isEbsOptimized(instanceType) {
      if (!instanceType) {
        return false;
      }
      let [family] = instanceType.split('.');
      return families.ebsOptimized.includes(family);
    }

    return {
      getCategories,
      getAvailableTypesForRegions,
      getAllTypesByRegion,
      filterInstanceTypes,
      isEbsOptimized,
    };
  }
);
