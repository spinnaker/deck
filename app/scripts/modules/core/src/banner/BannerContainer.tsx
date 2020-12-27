import React from 'react';
import { useCurrentStateAndParams } from '@uirouter/react';
import { UIRouterContextComponent } from '@uirouter/react-hybrid';

import { Overridable } from 'core/overrideRegistry';
import { IBannerSettings, SETTINGS } from 'core';
import { Application } from 'core/application';
import { customBannersByName } from './customBannersByName';

export interface IBannerContainerProps {
  app?: Application;
}

@Overridable('core.insight.banners')
export class BannerContainer extends React.Component<IBannerContainerProps> {
  public render(): React.ReactElement<BannerContainer> {
    return (
      <UIRouterContextComponent>
        <BannerContainerContent app={this.props.app} />
      </UIRouterContextComponent>
    );
  }
}

export const BannerContainerContent = ({ app }: IBannerContainerProps) => {
  const { state: currentState } = useCurrentStateAndParams();

  const validBanners = (SETTINGS.banners || [])
    .filter((m: IBannerSettings) => {
      const validRoute = m.routes.some((route: string) => currentState.name.includes(route));
      return m.active && validRoute && Boolean(customBannersByName[m.key]);
    })
    .map((m: IBannerSettings) => {
      const CustomBanner = customBannersByName[m.key];
      return <CustomBanner key={`banner-${m.key}`} app={app} />;
    });

  if (!validBanners.length) {
    return null;
  }

  return <div className="sp-margin-sm vertical">{validBanners}</div>;
};
