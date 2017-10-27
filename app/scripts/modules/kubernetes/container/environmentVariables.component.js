'use strict';

import _ from 'lodash';

const angular = require('angular');

module.exports = angular.module('spinnaker.deck.kubernetes.environmentVariables.component', [])
  .component('kubernetesContainerEnvironmentVariables', {
    bindings: {
      containers: '=',
      envVars: '='
    },
    templateUrl: require('./environmentVariables.component.html'),
    controller: function () {
      if (!this.envVars) {
        this.envVars = [];
      }

      this.containerNames = _.map(this.containers, function(container) {
        return container.name;
      });

      this.envVarsSourceTypes = this.envVars
        .map((envVar) => {
          if (_.get(envVar, 'envSource.configMapSource')) {
            return 'Config Map';
          } else if (_.get(envVar, 'envSource.secretSource')) {
            return 'Secret';
          } else if (_.get(envVar, 'envSource.fieldRef')) {
            return 'Field Ref';
          } else if (_.get(envVar, 'envSource.resourceFieldRef')) {
            return 'Resource Field Ref';
          } else {
            return 'Explicit';
          }
        });

      this.removeEnvVar = function(index) {
        this.envVars.splice(index, 1);
        this.envVarsSourceTypes.splice(index, 1);
      };

      this.addEnvVar = function() {
        this.envVars.push({});
        this.envVarsSourceTypes.push('Explicit');
      };

      this.sourceTypes = ['Explicit', 'Config Map', 'Secret', 'Field Ref', 'Resource Field Ref'];

      this.resourceRefFieldResourceOptions = ['limits.cpu', 'limits.memory', 'requests.cpu', 'requests.memory'];
      this.resourceRefFieldDivisorOptions = ['1', '1k', '1M', '1G', '1T', '1P', '1E', '1Ki', '1Mi', '1Gi', '1Ti', '1Pi', '1Ei'];

      this.updateSourceTypeMap = {
        'Explicit': (envVar) => {
          delete envVar.envSource;
        },
        'Config Map': (envVar) => {
          delete envVar.value;
          if (_.has(envVar, 'envSource.secretSource')) {
            delete envVar.envSource.secretSource;
          }
          if (_.has(envVar, 'envSource.fieldRef')) {
            delete envVar.envSource.fieldRef;
          }
          if (_.has(envVar, 'envSource.resourceFieldRef')) {
            delete envVar.envSource.fieldRef;
          }
        },
        'Secret': (envVar) => {
          delete envVar.value;
          if (_.has(envVar, 'envSource.configMapSource')) {
            delete envVar.envSource.configMapSource;
          }
          if (_.has(envVar, 'envSource.fieldRef')) {
            delete envVar.envSource.fieldRef;
          }
          if (_.has(envVar, 'envSource.resourceFieldRef')) {
            delete envVar.envSource.fieldRef;
          }
        },
        'Field Ref': (envVar) => {
          delete envVar.value;
          if (_.has(envVar, 'envSource.configMapSource')) {
            delete envVar.envSource.configMapSource;
          }
          if (_.has(envVar, 'envSource.secretSource')) {
            delete envVar.envSource.secretSource;
          }
          if (_.has(envVar, 'envSource.resourceFieldRef')) {
            delete envVar.envSource.fieldRef;
          }
        },
        'Resource Field Ref': (envVar) => {
          delete envVar.value;
          if (_.has(envVar, 'envSource.configMapSource')) {
            delete envVar.envSource.configMapSource;
          }
          if (_.has(envVar, 'envSource.secretSource')) {
            delete envVar.envSource.secretSource;
          }
          if (_.has(envVar, 'envSource.fieldRef')) {
            delete envVar.envSource.fieldRef;
          }
        }
      };

      this.updateEnvVar = (index) => {
        let envVar = this.envVars[index];
        let sourceType = this.envVarsSourceTypes[index];
        this.updateSourceTypeMap[sourceType](envVar);
      };
    }
  });
