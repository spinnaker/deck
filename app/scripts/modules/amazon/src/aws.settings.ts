import { IProviderSettings, SETTINGS } from '@spinnaker/core';

export interface IClassicLaunchWhitelist {
  region: string;
  credentials: string;
}

export interface IAWSProviderSettings extends IProviderSettings {
  defaults: {
    account?: string;
    region?: string;
    iamRole?: string;
    subnetType?: string;
    vpc?: string;
  };
  defaultSecurityGroups?: string[];
  loadBalancers?: {
    certificateTypes?: string[];
    disableManualOidcDialog?: boolean;
    inferInternalFlagFromSubnet: boolean;
  };
  useAmiBlockDeviceMappings?: boolean;
  classicLaunchLockout?: number;
  classicLaunchWhitelist?: IClassicLaunchWhitelist[];
  metrics?: {
    customNamespaces?: string[];
  };
  minRootVolumeSize?: number;
  disableSpotPricing?: boolean;
  createLoadBalancerWarnings?: {
    network?: string;
    application?: string;
    classic?: string;
  };
  instanceTypes?: {
    exclude?: {
      categories?: string[];
      families?: string[];
    };
  };
}

export const AWSProviderSettings: IAWSProviderSettings = (SETTINGS.providers.aws as IAWSProviderSettings) || {
  defaults: {},
};
if (AWSProviderSettings) {
  AWSProviderSettings.resetToOriginal = SETTINGS.resetProvider('aws');
}
