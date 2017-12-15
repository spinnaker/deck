import { cloneDeep, merge } from 'lodash';

export interface IProviderSettings {
  defaults: any;
  resetToOriginal?: () => void;
}

export interface INotificationSettings {
  email: {
    enabled: boolean;
  };
  hipchat: {
    enabled: boolean;
    botName: string;
  };
  sms: {
    enabled: boolean;
  };
  slack: {
    enabled: boolean;
    botName: string;
  };
}

export interface IFeatures {
  canary?: boolean;
  entityTags?: boolean;
  fiatEnabled?: boolean;
  pipelines?: boolean;
  notifications?: boolean;
  clusterDiff?: boolean;
  roscoMode?: boolean;
  chaosMonkey?: boolean;
  // whether stages affecting infrastructure (like "Create Load Balancer") should be enabled or not
  infrastructureStages?: boolean;
  jobs?: boolean;
  snapshots?: boolean;
  dockerBake?: boolean;
  pipelineTemplates?: boolean;
  versionedProviders?: boolean;
  travis?: boolean;
  [key: string]: any;
}

export interface ISpinnakerSettings {
  [key: string]: any;

  analytics: { ga?: string; };
  authEnabled: boolean;
  authEndpoint: string;
  authTtl: number;
  bakeryDetailUrl: string;
  changelog?: {
    accessToken?: string;
    fileName: string;
    gistId: string;
  };
  checkForUpdates: boolean;
  debugEnabled: boolean;
  defaultCategory: string;
  defaultInstancePort: number;
  defaultProviders: string[];
  defaultTimeZone: string; // see http://momentjs.com/timezone/docs/#/data-utilities/
  entityTags?: {
    maxUrlLength?: number;
  };
  executionWindow?: {
    atlas?: {
      regions: { label: string, baseUrl: string }[];
      url: string;
    }
  };
  feature: IFeatures;
  gateUrl: string;
  gitSources: string[];
  notifications: INotificationSettings;
  pollSchedule: number;
  providers?: {
    [key: string]: IProviderSettings; // allows custom providers not typed in here (good for testing too)
  };
  resetProvider: (provider: string) => () => void;
  resetToOriginal: () => void;
  searchVersion: 1 | 2;
  triggerTypes: string[];
}

export const SETTINGS: ISpinnakerSettings = (<any>window).spinnakerSettings;

// Make sure to set up some reasonable default settings fields so we do not have to keep checking if they exist everywhere
SETTINGS.feature = SETTINGS.feature || {};
SETTINGS.analytics = SETTINGS.analytics || {};
SETTINGS.providers = SETTINGS.providers || {};
SETTINGS.defaultTimeZone = SETTINGS.defaultTimeZone || 'America/Los_Angeles';

// A helper to make resetting settings to steady state after running tests easier
const originalSettings: ISpinnakerSettings = cloneDeep(SETTINGS);
SETTINGS.resetToOriginal = () => {
  Object.keys(SETTINGS)
    .filter(k => typeof SETTINGS[k] !== 'function') // maybe don't self-destruct
    .forEach(k => delete SETTINGS[k]);
  merge(SETTINGS, originalSettings);
};

SETTINGS.resetProvider = (provider: string) => {
  return () => {
    const providerSettings: IProviderSettings = SETTINGS.providers[provider];
    Object.keys(providerSettings)
      .filter(k => typeof (providerSettings as any)[k] !== 'function')
      .forEach(k => delete (providerSettings as any)[k]);
    merge(providerSettings, originalSettings.providers[provider]);
  };
};
