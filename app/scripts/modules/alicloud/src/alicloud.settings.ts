import { IProviderSettings, SETTINGS } from '@spinnaker/core';

export interface IClassicLaunchWhitelist {
  region: string;
  credentials: string;
}

export interface IAliCloudProviderSettings extends IProviderSettings {
  defaults: {
    account?: string;
    region?: string;
    iamRole?: string;
    subnetType?: string;
    vpc?: string;
  };
  defaultSecurityGroups?: string[];
  loadBalancers?: {
    inferInternalFlagFromSubnet: boolean;
    certificateTypes?: string[];
  };
  useAmiBlockDeviceMappings?: boolean;
  classicLaunchLockout?: number;
  classicLaunchWhitelist?: IClassicLaunchWhitelist[];
  metrics?: {
    customNamespaces?: string[];
  };
  minRootVolumeSize?: number;
  disableSpotPricing?: boolean;
}

export const AliCloudProviderSettings: IAliCloudProviderSettings = (SETTINGS.providers
  .alicloud as IAliCloudProviderSettings) || {
  defaults: {},
};
if (AliCloudProviderSettings) {
  AliCloudProviderSettings.resetToOriginal = SETTINGS.resetProvider('alicloud');
}
