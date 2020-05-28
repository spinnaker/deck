'use strict';

var gateHost = '{%gate.baseUrl%}';
var atlasWebComponentsUrl = '{%canary.atlasWebComponentsUrl%}';
var authEnabled = '{%features.auth%}' === 'true';
var authEndpoint = gateHost + '/auth/user';
var bakeryDetailUrl = gateHost + '/bakery/logs/{{context.region}}/{{context.status.resourceId}}';
var canaryFeatureDisabled = '{%canary.featureEnabled%}' !== 'true';
var canaryStagesEnabled = '{%canary.stages%}' === 'true';
var changelogGistId = '{%changelog.gist.id%}';
var changelogGistName = '{%changelog.gist.name%}';
var chaosEnabled = '{%features.chaos%}' === 'true';
var defaultCanaryJudge = '{%canary.defaultJudge%}';
var defaultMetricsStore = '{%canary.defaultMetricsStore%}';
var defaultMetricsAccountName = '{%canary.defaultMetricsAccount%}';
var defaultStorageAccountName = '{%canary.defaultStorageAccount%}';
var displayTimestampsInUserLocalTime = '{%features.displayTimestampsInUserLocalTime%}' === 'true';
var entityTagsEnabled = false;
var fiatEnabled = '{%features.fiat%}' === 'true';
var gceScaleDownControlsEnabled = '{%features.gceScaleDownControlsEnabled%}' === 'true';
var gceStatefulMigsEnabled = '{%features.gceStatefulMigsEnabled%}' === 'true';
var iapRefresherEnabled = '{%features.iapRefresherEnabled%}' === 'true';
var maxPipelineAgeDays = '{%maxPipelineAgeDays%}';
var mineCanaryEnabled = '{%features.mineCanary%}' === 'true';
var notificationsEnabled = '{%notifications.enabled%}' === 'true';
var onDemandClusterThreshold = '{%onDemandClusterThreshold%}';
var pipelineTemplatesEnabled = '{%features.pipelineTemplates%}' === 'true';
var reduxLoggerEnabled = '{%canary.reduxLogger%}' === 'true';
var showAllConfigsEnabled = '{%canary.showAllCanaryConfigs%}' === 'true';
var slack = {
  botName: '{%notifications.slack.botName%}',
  enabled: '{%notifications.slack.enabled%}' === 'true',
};
var sms = {
  enabled: '{%notifications.twilio.enabled%}' === 'true',
};
var githubStatus = {
  enabled: '{%notifications.github-status.enabled%}' === 'true',
};
var templatesEnabled = '{%canary.templatesEnabled%}' === 'true';
var timezone = '{%timezone%}';
var version = '{%version%}';
var functionsEnabled = '{%features.functions%}' === 'true';

// Cloud Providers
var appengine = {
  defaults: {
    account: '{%appengine.default.account%}',
  },
};
var aws = {
  defaults: {
    account: '{%aws.default.account%}',
    region: '{%aws.default.region%}',
  },
};
var azure = {
  defaults: {
    account: '{%azure.default.account%}',
    region: '{%azure.default.region%}',
  },
};
var cloudfoundry = {
  defaults: {
    account: '{%cloudfoundry.default.account%}',
  },
};
var dcos = {
  defaults: {
    account: '{%dcos.default.account%}',
  },
};
var ecs = {
  defaults: {
    account: '{%ecs.default.account%}',
  },
};
var gce = {
  defaults: {
    account: '{%google.default.account%}',
    region: '{%google.default.region%}',
    zone: '{%google.default.zone%}',
  },
};
var kubernetes = {
  defaults: {
    account: '{%kubernetes.default.account%}',
    namespace: '{%kubernetes.default.namespace%}',
  },
};
var huaweicloud = {
  defaults: {
    account: '{%huaweicloud.default.account%}',
    region: '{%huaweicloud.default.region%}',
  },
};
var oracle = {
  defaults: {
    account: '{%oracle.default.account%}',
    region: '{%oracle.default.region%}',
  },
};
var tencentcloud = {
  defaults: {
    account: '{%tencentcloud.default.account%}',
    region: '{%tencentcloud.default.region%}',
  },
};

window.spinnakerSettings = {
  authEnabled: authEnabled,
  authEndpoint: authEndpoint,
  bakeryDetailUrl: bakeryDetailUrl,
  canary: {
    atlasWebComponentsUrl: atlasWebComponentsUrl,
    defaultJudge: defaultCanaryJudge,
    featureDisabled: canaryFeatureDisabled,
    reduxLogger: reduxLoggerEnabled,
    metricsAccountName: defaultMetricsAccountName,
    metricStore: defaultMetricsStore,
    showAllConfigs: showAllConfigsEnabled,
    stagesEnabled: canaryStagesEnabled,
    storageAccountName: defaultStorageAccountName,
    templatesEnabled: templatesEnabled,
  },
  changelog: {
    fileName: changelogGistName,
    gistId: changelogGistId,
  },
  defaultInstancePort: 80,
  defaultTimeZone: timezone, // see http://momentjs.com/timezone/docs/#/data-utilities/
  feature: {
    canary: mineCanaryEnabled,
    chaosMonkey: chaosEnabled,
    displayTimestampsInUserLocalTime: displayTimestampsInUserLocalTime,
    entityTags: entityTagsEnabled,
    fiatEnabled: fiatEnabled,
    gceScaleDownControlsEnabled: gceScaleDownControlsEnabled,
    gceStatefulMigsEnabled: gceStatefulMigsEnabled,
    iapRefresherEnabled: iapRefresherEnabled,
    notifications: notificationsEnabled,
    pagerDuty: false,
    pipelines: true,
    pipelineTemplates: pipelineTemplatesEnabled,
    roscoMode: true,
    slack: false,
    snapshots: false,
    functions: functionsEnabled,
  },
  gateUrl: gateHost,
  maxPipelineAgeDays: maxPipelineAgeDays,
  notifications: {
    bearychat: {
      enabled: true,
    },
    email: {
      enabled: true,
    },
    githubStatus: githubStatus,
    googlechat: {
      enabled: true,
    },
    pubsub: {
      enabled: true,
    },
    slack: slack,
    sms: sms,
  },
  onDemandClusterThreshold: onDemandClusterThreshold,
  providers: {
    appengine: appengine,
    aws: aws,
    azure: azure,
    cloudfoundry: cloudfoundry,
    dcos: dcos,
    ecs: ecs,
    gce: gce,
    huaweicloud: huaweicloud,
    kubernetes: kubernetes,
    oracle: oracle,
    tencentcloud: tencentcloud,
  },
  triggerTypes: [
    'artifactory',
    'nexus',
    'concourse',
    'cron',
    'docker',
    'git',
    'jenkins',
    'pipeline',
    'pubsub',
    'travis',
    'webhook',
    'wercker',
  ],
  version: version,
};
