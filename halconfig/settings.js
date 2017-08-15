'use strict';

var feedbackUrl = '';
var gateHost = '{%gate.baseUrl%}';
var bakeryDetailUrl = (gateHost + '/bakery/logs/{{context.region}}/{{context.status.resourceId}}');
var authEndpoint = (gateHost + '/auth/user');
var authEnabled = {%features.auth%};
var chaosEnabled = {%features.chaos%};
var fiatEnabled = {%features.fiat%};
var jobsEnabled = {%features.jobs%};
var pipelineTemplatesEnabled = {%features.pipelineTemplates%};
var timezone = '{%timezone%}';
var version = '{%version%}';
var changelogGistId = '{%changelog.gist.id%}';
var changelogGistName = '{%changelog.gist.name%}';
var gce = {
  defaults: {
    account: '{%google.default.account%}',
    region: '{%google.default.region%}',
    zone: '{%google.default.zone%}'
  },
  associatePublicIpAddress: true,
};
var kubernetes = {
  defaults: {
    account: '{%kubernetes.default.account%}',
    namespace: '{%kubernetes.default.namespace%}',
    proxy: '{%kubernetes.default.proxy%}',
    internalDNSNameTemplate: '{{name}}.{{namespace}}.svc.cluster.local',
    instanceLinkTemplate: '{{host}}/api/v1/proxy/namespaces/{{namespace}}/pods/{{name}}',
  }
};
var appengine = {
  defaults: {
    account: '{%appengine.default.account%}',
    editLoadBalancerStageEnabled: {%appengine.enabled%}
  }
};
var openstack = {
  defaults: {
    account: '{%openstack.default.account%}',
    region: '{%openstack.default.region%}'
  }
};
var azure = {
  defaults: {
    account: '{%azure.default.account%}',
    region: '{%azure.default.region%}'
  }
};
var oraclebmcs = {
  defaults: {
    account: '{%oraclebmcs.default.account%}',
    region: '{%oraclebmcs.default.region%}'
  }
};
var dcos = {
  defaults: {
    account: '{%dcos.default.account%}'
  }
};
var entityTagsEnabled = false;
var netflixMode = false;

window.spinnakerSettings = {
  version: version,
  checkForUpdates: false,
  defaultProviders: ['aws', 'gce', 'azure', 'cf', 'kubernetes', 'titus', 'openstack', 'oraclebmcs', 'dcos'],
  feedbackUrl: feedbackUrl,
  gateUrl: gateHost,
  bakeryDetailUrl: bakeryDetailUrl,
  authEndpoint: authEndpoint,
  pollSchedule: 30000,
  defaultTimeZone: timezone, // see http://momentjs.com/timezone/docs/#/data-utilities/
  defaultCategory: 'serverGroup',
  defaultInstancePort: 80,
  providers: {
    azure: azure,
    aws: {
      defaults: {
        account: 'test',
        region: 'us-east-1',
        iamRole: 'BaseIAMRole',
      },
      defaultSecurityGroups: [],
      loadBalancers: {
        // if true, VPC load balancers will be created as internal load balancers if the selected subnet has a purpose
        // tag that starts with "internal"
        inferInternalFlagFromSubnet: false,
      },
      useAmiBlockDeviceMappings: false,
    },
    gce: gce,
    titus: {
      defaults: {
        account: 'titustestvpc',
        region: 'us-east-1',
        iamProfile: '{{application}}InstanceProfile',
      },
    },
    openstack: openstack,
    kubernetes: kubernetes,
    appengine: appengine,
    oraclebmcs: oraclebmcs,
    dcos: dcos
  },
  changelog: {
    gistId: changelogGistId,
    fileName: changelogGistName,
  },
  notifications: {
    email: {
      enabled: true,
    },
    hipchat: {
      enabled: true,
      botName: 'Skynet T-800'
    },
    sms: {
      enabled: true,
    },
    slack: {
      enabled: true,
      botName: 'spinnakerbot'
    }
  },
  authEnabled: authEnabled,
  authTtl: 600000,
  gitSources: ['stash', 'github', 'bitbucket'],
  triggerTypes: ['git', 'pipeline', 'docker', 'cron', 'jenkins', 'travis'],
  feature: {
    entityTags: entityTagsEnabled,
    fiatEnabled: fiatEnabled,
    netflixMode: netflixMode,
    chaosMonkey: chaosEnabled,
    jobs: jobsEnabled,
    pipelineTemplates: pipelineTemplatesEnabled,
    pipelines: true,
    notifications: false,
    fastProperty: true,
    vpcMigrator: true,
    clusterDiff: false,
    roscoMode: true,
    infrastructureStages: false,
    snapshots: false,
    travis: false,
  },
};
