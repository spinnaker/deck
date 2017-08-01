import {cloneDeep, merge} from 'lodash';

export interface IProviderSettings {
  defaults: {};
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
  travis?: boolean;
  infSearchEnabled?: boolean;  // TODO: temporary until new inf search is ready
  [key: string]: any;
}

export interface ISpinnakerSettings {
  checkForUpdates: boolean;
  debugEnabled: boolean;
  defaultProviders: string[];
  gateUrl: string;
  bakeryDetailUrl: string;
  authEndpoint: string;
  pollSchedule: number;
  defaultTimeZone: string; // see http://momentjs.com/timezone/docs/#/data-utilities/
  defaultCategory: string;
  defaultInstancePort: number;
  providers?: {
    [key: string]: IProviderSettings; // allows custom providers not typed in here (good for testing too)
  };
  notifications: INotificationSettings;
  authEnabled: boolean;
  authTtl: number;
  gitSources: string[];
  triggerTypes: string[];
  analytics: {
    ga?: string;
  };
  feature: IFeatures;
  executionWindow?: {
    atlas?: {
      regions: { label: string, baseUrl: string }[];
      url: string;
    }
  };
  entityTags?: {
    maxUrlLength?: number;
  };
  [key: string]: any;
  resetToOriginal: () => void;
  resetProvider: (provider: string) => () => void;
  changelog?: {
    gistId: string;
    fileName: string;
    accessToken?: string;
  };
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
