'use strict';


/**
 * This section is managed by scripts/reconfigure_spinnaker.sh
 * If hand-editing, only add comment lines that look like
 * '// var VARIABLE = VALUE'
 * and let scripts/reconfigure manage the actual values.
 */
// BEGIN reconfigure_spinnaker

// var gateUrl = ${services.gate.baseUrl};
var gateUrl = 'http://localhost:8084';
// var bakeryBaseUrl = ${services.bakery.baseUrl};
var bakeryBaseUrl = 'http://localhost:8087';
// var authEnabled = ${services.deck.auth.enabled};
var authEnabled = false;
// var defaultTimeZone = ${services.deck.timezone};
var defaultTimeZone = 'America/Los_Angeles';
// var awsDefaultRegion = ${providers.aws.defaultRegion};
var awsDefaultRegion = 'us-west-2';
// var awsPrimaryAccount = ${providers.aws.primaryCredentials.name};
var awsPrimaryAccount = 'my-aws-account';
// var googleDefaultRegion = ${providers.google.defaultRegion};
var googleDefaultRegion = '${SPINNAKER_GOOGLE_DEFAULT_REGION}';
// var googleDefaultZone = ${providers.google.defaultZone};
var googleDefaultZone = '${SPINNAKER_GOOGLE_DEFAULT_ZONE}';
// var googlePrimaryAccount = ${providers.google.primaryCredentials.name};
var googlePrimaryAccount = 'my-google-account';
// var azureDefaultRegion = ${providers.azure.defaultRegion};
var azureDefaultRegion = 'West US';
// var azurePrimaryAccount = ${providers.azure.primaryCredentials.name};
var azurePrimaryAccount = 'my-azure-account';
// var cfDefaultRegion = ${providers.cf.defaultOrg};
var cfDefaultRegion = 'spinnaker-cf-org';
// var cfDefaultZone = ${providers.cf.defaultSpace};
var cfDefaultZone = 'spinnaker-cf-space';
// var cfPrimaryAccount = ${providers.cf.primaryCredentials.name};
var cfPrimaryAccount = 'my-cf-account';
// var titanDefaultRegion = ${providers.titan.defaultRegion};
var titanDefaultRegion = 'us-east-1';
// var titanPrimaryAccount = ${providers.titan.primaryCredentials.name};
var titanPrimaryAccount = 'my-titan-account';
// var kubernetesDefaultNamespace = ${providers.kubernetes.primaryCredentials.namespace};
var kubernetesDefaultNamespace = 'default';
// var kubernetesPrimaryAccount = ${providers.kubernetes.primaryCredentials.name};
var kubernetesPrimaryAccount = 'my-kubernetes-account';

// END reconfigure_spinnaker
/**
 * Any additional custom var statements can go below without
 * being affected by scripts/reconfigure_spinnaker.sh
 */

window.spinnakerSettings = {
  gateUrl: gateUrl,
  bakeryDetailUrl: bakeryBaseUrl + '/api/v1/global/logs/{{context.status.id}}?html=true',
  authEndpoint: gateUrl + '/auth/info',
  pollSchedule: 30000,
  defaultTimeZone: defaultTimeZone, // see http://momentjs.com/timezone/docs/#/data-utilities/
  providers: {
    azure: {
      defaults: {
        account: azurePrimaryAccount,
        region: azureDefaultRegion
      },
    },
    gce: {
      defaults: {
        account: googlePrimaryAccount,
        region: googleDefaultRegion,
        zone: googleDefaultZone,
      }
    },
    aws: {
      defaults: {
        account: awsPrimaryAccount,
        region: awsDefaultRegion
      }
    },
    cf: {
      defaults: {
        account: cfPrimaryAccount,
        region: cfDefaultRegion
      },
    },
    titan: {
      defaults: {
        account: titanPrimaryAccount,
        region: titanDefaultRegion
      },
    },
    kubernetes: {
      defaults: {
        account: kubernetesPrimaryAccount,
        namespace: kubernetesDefaultNamespace
      },
    }
  },
  authEnabled: authEnabled,
  feature: {
    pipelines: true,
    notifications: false,
    fastProperty: false,
    vpcMigrator: false,
    clusterDiff: false,
    roscoMode: true,
    netflixMode: false,
  },
};
