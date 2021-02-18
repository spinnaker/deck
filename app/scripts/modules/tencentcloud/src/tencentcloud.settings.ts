import { IProviderSettings, SETTINGS } from '@spinnaker/core';

export interface IClassicLaunchAllowlist {
  region: string;
  credentials: string;
}

export interface ITencentcloudProviderSettings extends IProviderSettings {
  defaults: {
    account?: string;
    region?: string;
    subnetType?: string;
    vpc?: string;
  };
  defaultSecurityGroups?: string[];
  loadBalancers?: {
    inferInternalFlagFromSubnet: boolean;
    certificateTypes?: string[];
  };
  classicLaunchLockout?: number;
  classicLaunchAllowlist?: IClassicLaunchAllowlist[];
  metrics?: {
    customNamespaces?: string[];
  };
  minRootVolumeSize?: number;
  disableSpotPricing?: boolean;
}

export const TENCENTCLOUDProviderSettings: ITencentcloudProviderSettings = (SETTINGS.providers
  .tencentcloud as ITencentcloudProviderSettings) || { defaults: {} };

if (TENCENTCLOUDProviderSettings) {
  TENCENTCLOUDProviderSettings.resetToOriginal = SETTINGS.resetProvider('tencentcloud');
}
