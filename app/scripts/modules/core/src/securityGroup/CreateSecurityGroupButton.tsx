import * as React from 'react';

import { Application } from 'core/application';
import { CloudProviderRegistry, ICloudProviderConfig, ProviderSelectionService } from 'core/cloudProvider';
import { ModalInjector, ReactInjector } from 'core/reactShims';
import { Tooltip } from 'core/presentation';
import { IAccountDetails } from 'core/account';
import { SETTINGS } from 'core/config/settings';

import { FirewallLabels } from './label/FirewallLabels';

const providerFilterFn = (_application: Application, _account: IAccountDetails, provider: ICloudProviderConfig) => {
  const sgConfig = provider.securityGroup;
  return (
    sgConfig &&
    (sgConfig.CreateSecurityGroupModal ||
      (sgConfig.createSecurityGroupTemplateUrl && sgConfig.createSecurityGroupController))
  );
};

const getDefaultCredentials = (app: Application, provider: string) =>
  app.defaultCredentials[provider] || SETTINGS.providers[provider].defaults.account;
const getDefaultRegion = (app: Application, provider: string) =>
  app.defaultRegions[provider] || SETTINGS.providers[provider].defaults.region;

const getAngularModalOptions = (provider: any, selectedProvider: string, app: Application) => ({
  templateUrl: provider.createSecurityGroupTemplateUrl,
  controller: `${provider.createSecurityGroupController} as ctrl`,
  size: 'lg',
  resolve: {
    securityGroup: () => {
      return {
        credentials: getDefaultCredentials(app, selectedProvider),
        subnet: 'none',
        regions: [getDefaultRegion(app, selectedProvider)],
      };
    },
    application: () => {
      return app;
    },
  },
});

const getReactModalOptions = (selectedProvider: string, app: Application) => ({
  credentials: getDefaultCredentials(app, selectedProvider),
  application: app,
  isNew: true,
});

export const CreateSecurityGroupButton = ({ app }: { app: Application }) => {
  const createSecurityGroup = (): void => {
    const { skinSelectionService } = ReactInjector;

    ProviderSelectionService.selectProvider(app, 'securityGroup', providerFilterFn).then(selectedProvider => {
      skinSelectionService.selectSkin(selectedProvider).then(selectedSkin => {
        const provider = CloudProviderRegistry.getValue(selectedProvider, 'securityGroup', selectedSkin);

        if (provider.CreateSecurityGroupModal) {
          provider.CreateSecurityGroupModal.show(getReactModalOptions(selectedProvider, app));
        } else {
          // angular
          ModalInjector.modalService
            .open(getAngularModalOptions(provider, selectedProvider, app))
            .result.catch(() => {});
        }
      });
    });
  };
  let disableButton = false;
  console.log('Application providers from Firewall ');
  app.attributes.cloudProviders.forEach((element: any) => {
    const provider = CloudProviderRegistry.getValue(element, 'securityGroup');
    //console.log(provider);
    console.log(element + ' infra: ' + provider.infra);
    if (provider.infra) {
      disableButton = true;
    }
  });
  if (disableButton) {
    return (
      <div>
        <button className="btn btn-sm btn-default" onClick={createSecurityGroup}>
          <span className="glyphicon glyphicon-plus-sign visible-lg-inline" />
          <Tooltip value="Create Load Balancer">
            <span className="glyphicon glyphicon-plus-sign visible-md-inline visible-sm-inline" />
          </Tooltip>
          <span className="visible-lg-inline"> Create {FirewallLabels.get('Firewall')}</span>
        </button>
      </div>
    );
  } else {
    return <div></div>;
  }
};
