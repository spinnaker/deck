import { module } from 'angular';
import { StateParams } from '@uirouter/angularjs';

import { INestedState, STATE_CONFIG_PROVIDER, StateConfigProvider } from 'core/navigation';
import {
  APPLICATION_STATE_PROVIDER,
  ApplicationStateProvider,
  Application,
  ApplicationModelBuilder,
} from 'core/application';
import { SkinService } from 'core/cloudProvider';
import { FirewallLabels } from 'core/securityGroup/label';

import { SecurityGroupReader } from './securityGroupReader.service';
import { filterModelConfig } from './filter/SecurityGroupFilterModel';
import { SecurityGroupDetails } from './SecurityGroupDetails';
import { SecurityGroups } from './SecurityGroups';

export const SECURITY_GROUP_STATES = 'spinnaker.core.securityGroup.states';
module(SECURITY_GROUP_STATES, [APPLICATION_STATE_PROVIDER, STATE_CONFIG_PROVIDER]).config([
  'applicationStateProvider',
  'stateConfigProvider',
  (applicationStateProvider: ApplicationStateProvider, stateConfigProvider: StateConfigProvider) => {
    const firewallDetails: INestedState = {
      name: 'firewallDetails',
      url: '/firewallDetails/:provider/:accountId/:region/:vpcId/:name',
      params: {
        vpcId: {
          value: null,
          squash: true,
        },
      },
      views: {
        'detail@../insight': {
          component: SecurityGroupDetails,
          $type: 'react',
        },
      },
      resolve: {
        accountId: ['$stateParams', ($stateParams: StateParams) => $stateParams.accountId],
        resolvedSecurityGroup: [
          '$stateParams',
          ($stateParams: StateParams) => {
            return {
              name: $stateParams.name,
              accountId: $stateParams.accountId,
              provider: $stateParams.provider,
              region: $stateParams.region,
              vpcId: $stateParams.vpcId,
            };
          },
        ],
      },
      data: {
        pageTitleDetails: {
          title: `${FirewallLabels.get('Firewall')} Details`,
          nameParam: 'name',
          accountParam: 'accountId',
          regionParam: 'region',
        },
        history: {
          type: 'securityGroups',
        },
      },
    };

    const securityGroupSummary: INestedState = {
      url: `/firewalls?${stateConfigProvider.paramsToQuery(filterModelConfig)}`,
      name: 'firewalls',
      views: {
        nav: {
          template: '<security-group-filter app="$resolve.app"></security-group-filter>',
        },
        master: {
          component: SecurityGroups,
          $type: 'react',
        },
      },
      params: stateConfigProvider.buildDynamicParams(filterModelConfig),
      data: {
        pageTitleSection: {
          title: FirewallLabels.get('Firewalls'),
        },
      },
    };

    const standaloneFirewall: INestedState = {
      name: 'firewallDetails',
      url: '/firewallDetails/:provider/:accountId/:region/:vpcId/:name',
      params: {
        vpcId: {
          value: null,
          squash: true,
        },
      },
      views: {
        'main@': {
          templateUrl: require('../presentation/standalone.view.html'),
          controllerProvider: [
            '$stateParams',
            ($stateParams: StateParams) => {
              return SkinService.getValue(
                $stateParams.provider,
                $stateParams.accountId,
                'securityGroup.detailsController',
              );
            },
          ],
          controllerAs: 'ctrl',
        },
      },
      resolve: {
        resolvedSecurityGroup: [
          '$stateParams',
          ($stateParams: StateParams) => {
            return {
              name: $stateParams.name,
              accountId: $stateParams.accountId,
              provider: $stateParams.provider,
              region: $stateParams.region,
              vpcId: $stateParams.vpcId,
            };
          },
        ],
        app: [
          '$stateParams',
          'securityGroupReader',
          ($stateParams: StateParams, securityGroupReader: SecurityGroupReader): ng.IPromise<Application> => {
            // we need the application to have a firewall index (so rules get attached and linked properly)
            // and its name should just be the name of the firewall (so cloning works as expected)
            return securityGroupReader.loadSecurityGroups().then(securityGroupsIndex => {
              const application: Application = ApplicationModelBuilder.createStandaloneApplication($stateParams.name);
              application['securityGroupsIndex'] = securityGroupsIndex; // TODO: refactor the securityGroupsIndex out
              return application;
            });
          },
        ],
      },
      data: {
        pageTitleDetails: {
          title: `${FirewallLabels.get('Firewall')} Details`,
          nameParam: 'name',
          accountParam: 'accountId',
          regionParam: 'region',
        },
        history: {
          type: 'securityGroups',
        },
      },
    };

    applicationStateProvider.addInsightState(securityGroupSummary);
    applicationStateProvider.addInsightDetailState(firewallDetails);
    stateConfigProvider.addToRootState(standaloneFirewall);
    stateConfigProvider.addRewriteRule(
      '/applications/{application}/securityGroups',
      '/applications/{application}/firewalls',
    );
    stateConfigProvider.addRewriteRule(/(.+?)\/securityGroupDetails\/(.*)/, ($match: string[]) => {
      return `${$match[1]}/firewallDetails/${$match[2]}`;
    });
  },
]);
