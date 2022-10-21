import { cloneDeep, merge } from 'lodash';

export interface IAdditionalHelpLinks {
  text: string;
  url: string;
  icon?: string;
}

export interface IProviderSettings {
  bakeryRegions?: string[];
  defaults: any;
  resetToOriginal?: () => void;
}

export interface INotificationSettings {
  bearychat: { enabled: boolean };
  email: { enabled: boolean };
  githubStatus: { enabled: boolean };
  googlechat: { enabled: boolean };
  microsoftteams: { enabled: boolean };
  pubsub: { enabled: boolean };
  slack: { botName: string; enabled: boolean };
  sms: { enabled: boolean };
}

export interface IFeatures {
  [key: string]: any;
  canary?: boolean;
  chaosMonkey?: boolean;
  ci?: boolean;
  displayTimestampsInUserLocalTime?: boolean;
  dockerBake?: boolean;
  entityTags?: boolean;
  executionMarkerInformationModal?: boolean;
  fiatEnabled?: boolean;
  iapRefresherEnabled?: boolean;
  managedDelivery?: boolean;
  mdGitIntegration?: boolean;
  managedServiceAccounts?: boolean;
  managedResources?: boolean;
  notifications?: boolean;
  pagerDuty?: boolean;
  pipelines?: boolean;
  pipelineTemplates?: boolean;
  quietPeriod?: boolean;
  roscoMode?: boolean;
  slack?: boolean;
  snapshots?: boolean;
  savePipelinesStageEnabled?: boolean;
  functions?: boolean;
  kubernetesRawResources?: boolean;
  renderPipelineStageThreshold?: number;
}

export interface IDockerInsightSettings {
  enabled: boolean;
  url: string;
}

export interface IBannerSettings {
  key: string;
  active: boolean;
  routes: string[];
}

export interface INewApplicationDefaults {
  chaosMonkey?: boolean;
}

export interface IManagedDeliveryURLs {
  gettingStarted: string;
  root: string;
  pinning: string;
  resourceStatus: string;
  markAsBad: string;
  previewEnvironments?: string;
}

export interface ISpinnakerSettings {
  [key: string]: any;
  accountTagLimit?: number;
  analytics: {
    customConfig?: {
      siteSpeedSampleRate?: number;
    };
    ga?: string;
  };
  apiTimeoutMs: number;
  authEnabled: boolean;
  authEndpoint: string;
  authTtl: number;
  bakeryDetailUrl: string;
  banners?: IBannerSettings[];
  checkForUpdates: boolean;
  debugEnabled: boolean;
  maxRunningExecutionsToRetrieve: number;
  defaultInstancePort: number;
  defaultProviders: string[];
  defaultTimeZone: string; // see http://momentjs.com/timezone/docs/#/data-utilities/
  dockerInsights: IDockerInsightSettings;
  disabledImages?: string[];
  entityTags?: {
    maxUrlLength?: number;
    maxResults?: number;
  };
  executionWindow?: {
    atlas?: {
      regions: Array<{ label: string; baseUrl: string }>;
      url: string;
    };
  };
  feature: IFeatures;
  feedback?: {
    icon?: string;
    text?: string;
    url: string;
  };
  additionalHelpLinks?: IAdditionalHelpLinks[];
  gateUrl: string;
  gitSources: string[];
  hiddenStages: string[];
  managedDelivery?: {
    defaultManifest: string;
    manifestBasePath: string;
    urls?: Partial<IManagedDeliveryURLs>;
  };
  maxPipelineAgeDays: number;
  newApplicationDefaults: INewApplicationDefaults;
  notifications: INotificationSettings;
  onDemandClusterThreshold: number;
  pagerDuty?: {
    accountName?: string;
    defaultDetails?: string;
    defaultSubject?: string;
    required?: boolean;
  };
  slack?: {
    baseUrl: string;
  };
  stashTriggerInfo?: string;
  pollSchedule: number;
  providers?: {
    [key: string]: IProviderSettings; // allows custom providers not typed in here (good for testing too)
  };
  pubsubProviders: string[];
  resetProvider: (provider: string) => () => void;
  resetToOriginal: () => void;
  searchVersion: 1 | 2;
  triggerTypes: string[];
  useClassicFirewallLabels: boolean;
  kubernetesAdHocInfraWritesEnabled: boolean;
  changelogUrl: string;
}

export const SETTINGS: ISpinnakerSettings = (window as any).spinnakerSettings || {};

// Make sure to set up some reasonable default settings fields so we do not have to keep checking if they exist everywhere
SETTINGS.feature = SETTINGS.feature || {};
SETTINGS.feature.roscoMode = SETTINGS.feature.roscoMode ?? true;
SETTINGS.kubernetesAdHocInfraWritesEnabled = SETTINGS.kubernetesAdHocInfraWritesEnabled ?? true;
SETTINGS.analytics = SETTINGS.analytics || {};
SETTINGS.providers = SETTINGS.providers || {};
SETTINGS.defaultTimeZone = SETTINGS.defaultTimeZone || 'America/Los_Angeles';
SETTINGS.dockerInsights = SETTINGS.dockerInsights || { enabled: false, url: '' };
SETTINGS.changelogUrl = SETTINGS.changelogUrl || 'https://spinnaker.io/changelogs/:version-changelog';
SETTINGS.managedDelivery = SETTINGS.managedDelivery || {
  defaultManifest: 'spinnaker.yml',
  manifestBasePath: '.spinnaker',
};

// A helper to make resetting settings to steady state after running tests easier
const originalSettings: ISpinnakerSettings = cloneDeep(SETTINGS);
SETTINGS.resetToOriginal = () => {
  Object.keys(SETTINGS)
    .filter((k) => typeof SETTINGS[k] !== 'function') // maybe don't self-destruct
    .forEach((k) => delete SETTINGS[k]);
  merge(SETTINGS, originalSettings);
};

SETTINGS.resetProvider = (provider: string) => {
  return () => {
    const providerSettings: IProviderSettings = SETTINGS.providers[provider];
    Object.keys(providerSettings)
      .filter((k) => typeof (providerSettings as any)[k] !== 'function')
      .forEach((k) => delete (providerSettings as any)[k]);
    merge(providerSettings, originalSettings.providers[provider]);
  };
};
