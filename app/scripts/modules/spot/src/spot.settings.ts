import { IProviderSettings, SETTINGS } from '@spinnaker/core';

export interface ISpotProviderSettings extends IProviderSettings {
  defaults: {
    account?: string;
    region?: string;
  };
}

export const SpotProviderSettings: ISpotProviderSettings = (SETTINGS.providers.spot as ISpotProviderSettings) || {
  defaults: {},
};
if (SpotProviderSettings) {
  SpotProviderSettings.resetToOriginal = SETTINGS.resetProvider('spot');
}
