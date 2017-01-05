import {module} from 'angular';
import {IState, IStateParamsService, IStateProvider, IUrlRouterProvider} from 'angular-ui-router';
import {APPLICATION_READ_SERVICE, ApplicationReader} from 'core/application/service/application.read.service';

require('./navigation.less');

interface IMatch {
  path: string;
}

interface IDeckState extends IState {
  children?: IDeckState[];
}

interface IDeckStateProviderConfig {
  buildApplication?: (mainView: string,
                      relativeUrl?: string,
                      baseChildren?: IDeckState[]) => IDeckState;
  children?: Map<string, IDeckState>;
}

interface IDeckStateProvider {
  state: (config: IDeckStateProviderConfig) => IDeckState;
}

interface IDeckStateParamService extends IStateParamsService {
  account: string;
  accountId: string;
  application: string;
  instanceId: string;
  job: string;
  name: string;
  project: string;
  provider: string;
  region: string;
  serverGroup: string;
  vpcId: string;
}

class InstanceDetails implements IDeckStateProvider {

  public state(): IDeckState {
    return {
      name: 'instanceDetails',
      url: '/instanceDetails/:provider/:instanceId',
      views: {
        'detail@../insight': {
          templateProvider: ['$templateCache', '$stateParams', 'cloudProviderRegistry',
            ($templateCache: ng.ITemplateCacheService,
             $stateParams: IDeckStateParamService,
             cloudProviderRegistry: any) => {
              return $templateCache.get(cloudProviderRegistry.getValue($stateParams.provider, 'instance.detailsTemplateUrl'));
            }],
          controllerProvider: ['$stateParams', 'cloudProviderRegistry',
            ($stateParams: IDeckStateParamService,
             cloudProviderRegistry: any) => {
              return cloudProviderRegistry.getValue($stateParams.provider, 'instance.detailsController');
            }],
          controllerAs: 'ctrl'
        }
      },
      resolve: {
        overrides: () => {
          return {};
        },
        instance: ['$stateParams', ($stateParams: IDeckStateParamService) => {
          return {
            instanceId: $stateParams.instanceId
          };
        }]
      },
      data: {
        pageTitleDetails: {
          title: 'Instance Details',
          nameParam: 'instanceId'
        },
        history: {
          type: 'instances',
        }
      }
    };
  }
}

class MultipleInstances implements IDeckStateProvider {

  public state(): IDeckState {
    return {
      name: 'multipleInstances',
      url: '/multipleInstances',
      views: {
        'detail@../insight': {
          templateUrl: require('../instance/details/multipleInstances.view.html'),
          controller: 'MultipleInstancesCtrl',
          controllerAs: 'vm'
        }
      },
      data: {
        pageTitleDetails: {
          title: 'Multiple Instances',
        }
      }
    };
  }
}

class MultipleServerGroups implements IDeckStateProvider {

  public state(): IDeckState {
    return {
      name: 'multipleServerGroups',
      url: '/multipleServerGroups',
      views: {
        'detail@../insight': {
          templateUrl: require('../serverGroup/details/multipleServerGroups.view.html'),
          controller: 'MultipleServerGroupsCtrl',
          controllerAs: 'vm'
        }
      },
      data: {
        pageTitleDetails: {
          title: 'Multiple Server Groups',
        }
      }
    };
  }
}

class ServerGroupDetails implements IDeckStateProvider {

  public state(): IDeckState {
    return {
      name: 'serverGroup',
      url: '/serverGroupDetails/:provider/:accountId/:region/:serverGroup',
      views: {
        'detail@../insight': {
          templateProvider: ['$templateCache', '$stateParams', 'cloudProviderRegistry',
            ($templateCache: ng.ITemplateCacheService,
             $stateParams: IDeckStateParamService,
             cloudProviderRegistry: any) => {
              return $templateCache.get(cloudProviderRegistry.getValue($stateParams.provider, 'serverGroup.detailsTemplateUrl'));
            }],
          controllerProvider: ['$stateParams', 'cloudProviderRegistry',
            ($stateParams: IDeckStateParamService,
             cloudProviderRegistry: any) => {
              return cloudProviderRegistry.getValue($stateParams.provider, 'serverGroup.detailsController');
            }],
          controllerAs: 'ctrl'
        }
      },
      resolve: {
        serverGroup: ['$stateParams', ($stateParams: IDeckStateParamService) => {
          return {
            name: $stateParams.serverGroup,
            accountId: $stateParams.accountId,
            region: $stateParams.region
          };
        }]
      },
      data: {
        pageTitleDetails: {
          title: 'Server Group Details',
          nameParam: 'serverGroup',
          accountParam: 'accountId',
          regionParam: 'region'
        },
        history: {
          type: 'serverGroups',
        }
      }
    };
  }
}

class JobDetails implements IDeckStateProvider {

  public state(): IDeckState {
    return {
      name: 'job',
      url: '/jobDetails/:provider/:accountId/:region/:job',
      views: {
        'detail@../insight': {
          templateProvider: ['$templateCache', '$stateParams', 'cloudProviderRegistry',
            ($templateCache: ng.ITemplateCacheService,
             $stateParams: IDeckStateParamService,
             cloudProviderRegistry: any) => {
              return $templateCache.get(cloudProviderRegistry.getValue($stateParams.provider, 'job.detailsTemplateUrl'));
            }],
          controllerProvider: ['$stateParams', 'cloudProviderRegistry',
            ($stateParams: IDeckStateParamService,
             cloudProviderRegistry: any) => {
              return cloudProviderRegistry.getValue($stateParams.provider, 'job.detailsController');
            }],
          controllerAs: 'ctrl'
        }
      },
      resolve: {
        job: ['$stateParams', ($stateParams: IDeckStateParamService) => {
          return {
            name: $stateParams.job,
            accountId: $stateParams.accountId,
            region: $stateParams.region
          };
        }]
      },
      data: {
        pageTitleDetails: {
          title: 'Job Details',
          nameParam: 'job',
          accountParam: 'accountId',
          regionParam: 'region'
        },
        history: {
          type: 'jobs',
        }
      }
    };
  }
}

class LoadBalancerDetails implements IDeckStateProvider {

  public state(): IDeckState {
    return {
      name: 'loadBalancerDetails',
      url: '/loadBalancerDetails/:provider/:accountId/:region/:vpcId/:name',
      params: {
        vpcId: {
          value: null,
          squash: true,
        }
      },
      views: {
        'detail@../insight': {
          templateProvider: ['$templateCache', '$stateParams', 'cloudProviderRegistry',
            ($templateCache: ng.ITemplateCacheService,
             $stateParams: IDeckStateParamService,
             cloudProviderRegistry: any) => {
              return $templateCache.get(cloudProviderRegistry.getValue($stateParams.provider, 'loadBalancer.detailsTemplateUrl'));
            }],
          controllerProvider: ['$stateParams', 'cloudProviderRegistry',
            ($stateParams: IDeckStateParamService,
             cloudProviderRegistry: any) => {
              return cloudProviderRegistry.getValue($stateParams.provider, 'loadBalancer.detailsController');
            }],
          controllerAs: 'ctrl'
        }
      },
      resolve: {
        loadBalancer: ['$stateParams', ($stateParams: IDeckStateParamService) => {
          return {
            name: $stateParams.name,
            accountId: $stateParams.accountId,
            region: $stateParams.region,
            vpcId: $stateParams.vpcId
          };
        }]
      },
      data: {
        pageTitleDetails: {
          title: 'Load Balancer Details',
          nameParam: 'name',
          accountParam: 'accountId',
          regionParam: 'region'
        },
        history: {
          type: 'loadBalancers',
        },
      }
    };
  }
}

class SecurityGroupDetails implements IDeckStateProvider {

  public state(): IDeckState {
    return {
      name: 'securityGroupDetails',
      url: '/securityGroupDetails/:provider/:accountId/:region/:vpcId/:name',
      params: {
        vpcId: {
          value: null,
          squash: true,
        }
      },
      views: {
        'detail@../insight': {
          templateProvider: ['$templateCache', '$stateParams', 'cloudProviderRegistry',
            ($templateCache: ng.ITemplateCacheService,
             $stateParams: IDeckStateParamService,
             cloudProviderRegistry: any) => {
              return $templateCache.get(cloudProviderRegistry.getValue($stateParams.provider, 'securityGroup.detailsTemplateUrl'));
            }],
          controllerProvider: ['$stateParams', 'cloudProviderRegistry',
            ($stateParams: IDeckStateParamService,
             cloudProviderRegistry: any) => {
              return cloudProviderRegistry.getValue($stateParams.provider, 'securityGroup.detailsController');
            }],
          controllerAs: 'ctrl'
        }
      },
      resolve: {
        resolvedSecurityGroup: ['$stateParams', ($stateParams: IDeckStateParamService) => {
          return {
            name: $stateParams.name,
            accountId: $stateParams.accountId,
            provider: $stateParams.provider,
            region: $stateParams.region,
            vpcId: $stateParams.vpcId,
          };
        }]
      },
      data: {
        pageTitleDetails: {
          title: 'Security Group Details',
          nameParam: 'name',
          accountParam: 'accountId',
          regionParam: 'region'
        },
        history: {
          type: 'securityGroups',
        },
      }
    };
  }
}

class TaskDetails implements IDeckStateProvider {

  public state(): IDeckState {
    return {
      name: 'taskDetails',
      url: '/:taskId',
      views: {},
      data: {
        pageTitleDetails: {
          title: 'Task Details',
          nameParam: 'taskId'
        }
      }
    };
  }
}

class Insight implements IDeckStateProvider {

  public state(config: IDeckStateProviderConfig): IDeckState {
    return {
      name: 'insight',
      abstract: true,
      views: {
        'insight': {
          templateUrl: require('../insight/insight.html'),
          controller: 'InsightCtrl',
          controllerAs: 'insight'
        }
      },
      children: [
        {
          name: 'clusters',
          url: '/clusters',
          views: {
            'nav': {
              templateUrl: require('../cluster/filter/filterNav.html'),
              controller: 'ClusterFilterCtrl',
              controllerAs: 'clustersFilters'
            },
            'master': {
              templateUrl: require('../cluster/all.html'),
              controller: 'AllClustersCtrl',
              controllerAs: 'allClusters'
            }
          },
          data: {
            pageTitleSection: {
              title: 'Clusters'
            }
          },
          children: [
            config.children.get('loadBalancerDetails'),
            config.children.get('serverGroupDetails'),
            config.children.get('jobDetails'),
            config.children.get('instanceDetails'),
            config.children.get('securityGroupDetails'),
            config.children.get('multipleInstances'),
            config.children.get('multipleServerGroups')
          ],
        },
        {
          url: '/loadBalancers',
          name: 'loadBalancers',
          views: {
            'nav': {
              templateUrl: require('../loadBalancer/filter/filterNav.html'),
              controller: 'LoadBalancerFilterCtrl',
              controllerAs: 'loadBalancerFilters'
            },
            'master': {
              templateUrl: require('../loadBalancer/all.html'),
              controller: 'AllLoadBalancersCtrl',
              controllerAs: 'ctrl'
            }
          },
          data: {
            pageTitleSection: {
              title: 'Load Balancers'
            }
          },
          children: [
            config.children.get('loadBalancerDetails'),
            config.children.get('serverGroupDetails'),
            config.children.get('jobDetails'),
            config.children.get('instanceDetails'),
            config.children.get('securityGroupDetails')
          ]
        },
        {
          url: '/securityGroups',
          name: 'securityGroups',
          views: {
            'nav': {
              templateUrl: require('../securityGroup/filter/filterNav.html'),
              controller: 'SecurityGroupFilterCtrl',
              controllerAs: 'securityGroupFilters'
            },
            'master': {
              templateUrl: require('../securityGroup/all.html'),
              controller: 'AllSecurityGroupsCtrl',
              controllerAs: 'ctrl'
            }
          },
          data: {
            pageTitleSection: {
              title: 'Security Groups'
            }
          },
          children: [
            config.children.get('loadBalancerDetails'),
            config.children.get('serverGroupDetails'),
            config.children.get('jobDetails'),
            config.children.get('securityGroupDetails')
          ]
        }
      ]
    };
  }
}

class Tasks implements IDeckStateProvider {

  public state(config: IDeckStateProviderConfig): IDeckState {
    return {
      name: 'tasks',
      url: '/tasks',
      views: {
        'insight': {
          templateUrl: require('../task/tasks.html'),
          controller: 'TasksCtrl',
          controllerAs: 'tasks'
        }
      },
      data: {
        pageTitleSection: {
          title: 'Tasks'
        }
      },
      children: [config.children.get('taskDetails')],
    };
  }
}

class Config implements IDeckStateProvider {

  public state(): IDeckState {
    return {
      name: 'config',
      url: '/config',
      views: {
        'insight': {
          templateProvider: ['$templateCache', 'overrideRegistry',
            ($templateCache: ng.ITemplateCacheService,
             overrideRegistry: any) => {
              const template: string =
                overrideRegistry.getTemplate('applicationConfigView', require('../application/config/applicationConfig.view.html'));
              return $templateCache.get(template);
            }],
          controller: 'ApplicationConfigController',
          controllerAs: 'config'
        }
      },
      data: {
        pageTitleSection: {
          title: 'Config'
        }
      }
    };
  }
}

class Projects implements IDeckStateProvider {

  public state(): IDeckState {
    return {
      name: 'projects',
      url: '/projects',
      views: {
        'main@': {
          templateUrl: require('../projects/projects.html'),
          controller: 'ProjectsCtrl',
          controllerAs: 'ctrl'
        }
      },
      data: {
        pageTitleMain: {
          label: 'Projects'
        }
      },
      children: []
    };
  }
}

class Infrastructure implements IDeckStateProvider {

  public state(): IDeckState {
    return {
      name: 'infrastructure',
      url: '/infrastructure?q',
      reloadOnSearch: false,
      views: {
        'main@': {
          templateUrl: require('../search/infrastructure/infrastructure.html'),
          controller: 'InfrastructureCtrl',
          controllerAs: 'ctrl'
        }
      },
      data: {
        pageTitleMain: {
          label: 'Infrastructure'
        }
      }
    };
  }
}

class StandaloneInstance implements IDeckStateProvider {

  public state(): IDeckState {
    return {
      name: 'instanceDetails',
      url: '/instance/:provider/:account/:region/:instanceId',
      views: {
        'main@': {
          templateUrl: require('../presentation/standalone.view.html'),
          controllerProvider: ['$stateParams', 'cloudProviderRegistry',
            ($stateParams: IDeckStateParamService,
             cloudProviderRegistry: any) => {
              return cloudProviderRegistry.getValue($stateParams.provider, 'instance.detailsController');
            }],
          controllerAs: 'ctrl'
        }
      },
      resolve: {
        instance: ['$stateParams', ($stateParams: IDeckStateParamService) => {
          return {
            instanceId: $stateParams.instanceId,
            account: $stateParams.account,
            region: $stateParams.region,
            noApplication: true
          };
        }],
        app: () => {
          return {
            name: '(standalone instance)',
            isStandalone: true,
          };
        },
        overrides: () => {
          return {};
        }
      },
      data: {
        pageTitleDetails: {
          title: 'Instance Details',
          nameParam: 'instanceId'
        },
        history: {
          type: 'instances',
        }
      }
    };
  }
}

class Applications implements IDeckStateProvider {

  public state(config: IDeckStateProviderConfig): IDeckState {
    return {
      name: 'applications',
      url: '/applications',
      views: {
        'main@': {
          templateUrl: require('../application/applications.html'),
          controller: 'ApplicationsCtrl',
          controllerAs: 'ctrl'
        }
      },
      data: {
        pageTitleMain: {
          label: 'Applications'
        }
      },
      children: [
        config.buildApplication('main@', '', [config.children.get('insight'), config.children.get('tasks'), config.children.get('config')])
      ]
    };
  }
}

class Dashboard implements IDeckStateProvider {

  public state(): IDeckState {
    return {
      name: 'dashboard',
      url: '/dashboard',
      views: {
        detail: {
          templateUrl: require('../projects/dashboard/dashboard.html'),
          controller: 'ProjectDashboardCtrl',
          controllerAs: 'vm'
        }
      },
      data: {
        pageTitleSection: {
          title: 'Dashboard'
        }
      }
    };
  }
}

class Project implements IDeckStateProvider {

  public state(config: IDeckStateProviderConfig): IDeckState {
    return {
      name: 'project',
      url: '/projects/{project}',
      resolve: {
        projectConfiguration: ['$stateParams', 'projectReader',
          ($stateParams: IDeckStateParamService,
           projectReader: any) => {
            return projectReader.getProjectConfig($stateParams.project).then(
              (projectConfig: any) => projectConfig,
              () => {
                return {notFound: true, name: $stateParams.project};
              }
            );
          }]
      },
      views: {
        'main@': {
          templateUrl: require('../projects/project.html'),
          controller: 'ProjectCtrl',
          controllerAs: 'vm',
        },
      },
      data: {
        pageTitleMain: {
          field: 'project'
        },
        history: {
          type: 'projects'
        }
      },
      children: [
        config.children.get('dashboard'),
        config.buildApplication('detail', '/applications', [config.children.get('insight'), config.children.get('tasks'), config.children.get('config')]),
      ]
    };
  }
}

class StandaloneSecurityGroup implements IDeckStateProvider {

  public state(): IDeckState {
    return {
      name: 'securityGroupDetails',
      url: '/securityGroupDetails/:provider/:accountId/:region/:vpcId/:name',
      params: {
        vpcId: {
          value: null,
          squash: true,
        },
      },
      views: {
        'main@': {
          templateUrl: require('../presentation/standalone.view.html'),
          controllerProvider: ['$stateParams', 'cloudProviderRegistry',
            ($stateParams: IDeckStateParamService,
             cloudProviderRegistry: any) => {
              return cloudProviderRegistry.getValue($stateParams.provider, 'securityGroup.detailsController');
            }],
          controllerAs: 'ctrl'
        }
      },
      resolve: {
        resolvedSecurityGroup: ['$stateParams', ($stateParams: IDeckStateParamService) => {
          return {
            name: $stateParams.name,
            accountId: $stateParams.accountId,
            provider: $stateParams.provider,
            region: $stateParams.region,
            vpcId: $stateParams.vpcId
          };
        }],
        app: ['$stateParams', 'securityGroupReader',
          ($stateParams: IDeckStateParamService,
           securityGroupReader: any) => {
            // we need the application to have a security group index (so rules get attached and linked properly)
            // and its name should just be the name of the security group (so cloning works as expected)
            return securityGroupReader.loadSecurityGroups()
              .then((securityGroupsIndex: any) => {
                return {
                  name: $stateParams.name,
                  isStandalone: true,
                  securityGroupsIndex: securityGroupsIndex
                };
              });
          }]
      },
      data: {
        pageTitleDetails: {
          title: 'Security Group Details',
          nameParam: 'name',
          accountParam: 'accountId',
          regionParam: 'region'
        },
        history: {
          type: 'securityGroups',
        }
      }
    };
  }
}

export interface IStateConfig {
  parent: string;
  state: IState;
}

export class StatesProvider implements ng.IServiceProvider {

  static get $inject(): string[] {
    return ['$stateProvider', '$urlRouterProvider', 'stateHelperProvider', 'deliveryStates', 'settings'];
  }

  private addedStates: Map<string, IState[]> = new Map<string, IState[]>();

  private augmentChildren(state: IDeckState): void {
    if (this.addedStates.get(state.name)) {
      state.children = (state.children || []).concat(this.addedStates.get(state.name));
    }
  }

  private application(mainView: string, relativeUrl = '', baseChildren: IDeckState[] = []): IDeckState {
    const children: IDeckState[] = [...baseChildren];
    if (this.settings.feature && this.settings.feature.pipelines !== false) {
      children.push(this.deliveryStates.pipelines);
    }

    const applicationConfig: IDeckState = {
      name: 'application',
      url: `${relativeUrl}/:application`,
      resolve: {
        app: ['$stateParams', 'applicationReader', 'inferredApplicationWarning',
          ($stateParams: IDeckStateParamService,
           applicationReader: ApplicationReader,
           inferredApplicationWarning: any) => {
            return applicationReader.getApplication($stateParams.application)
              .then(
                (app: any) => {
                  if (this.settings.feature.fiatEnabled) {
                    inferredApplicationWarning.checkIfInferredAndWarn(app);
                  }
                  return app || {notFound: true, name: $stateParams.application};
                },
                () => {
                  return {notFound: true, name: $stateParams.application};
                }
              );
          }]
      },
      data: {
        pageTitleMain: {
          field: 'application'
        },
        history: {
          type: 'applications',
          keyParams: ['application']
        },
      },
      children: children,
    };

    this.augmentChildren(applicationConfig);
    applicationConfig.views = {};
    applicationConfig.views[mainView] = {
      templateUrl: require('../application/application.html'),
      controller: 'ApplicationCtrl',
      controllerAs: 'ctrl'
    };

    return applicationConfig;
  }

  constructor(private $stateProvider: IStateProvider,
              private $urlRouterProvider: IUrlRouterProvider,
              stateHelperProvider: any,
              private deliveryStates: any,
              private settings: any) {

    const states: Map<string, IDeckState> = new Map<string, IDeckState>();
    states.set('instanceDetails', (new InstanceDetails()).state());
    states.set('multipleInstances', (new MultipleInstances()).state());
    states.set('multipleServerGroups', (new MultipleServerGroups()).state());
    states.set('serverGroupDetails', (new ServerGroupDetails()).state());
    states.set('jobDetails', (new JobDetails()).state());
    states.set('loadBalancerDetails', (new LoadBalancerDetails()).state());
    states.set('securityGroupDetails', (new SecurityGroupDetails()).state());
    states.set('taskDetails', (new TaskDetails()).state());

    const insight: IDeckState = (new Insight()).state({
      children: states
    });
    states.set('insight', insight);

    const tasks: IDeckState = (new Tasks()).state({
      children: new Map<string, IDeckState>([['taskDetails', states.get('taskDetails')]])
    });
    states.set('tasks', tasks);

    states.set('config', (new Config()).state());
    states.set('projects', (new Projects()).state());
    states.set('infrastructure', (new Infrastructure()).state());
    states.set('standaloneInstance', (new StandaloneInstance()).state());
    states.set('dashboard', (new Dashboard()).state());
    states.set('standaloneSecurityGroup', (new StandaloneSecurityGroup()).state());

    const applications: IDeckState = (new Applications()).state({
      buildApplication: this.application,
      children: states
    });

    const project: IDeckState = (new Project()).state({
      buildApplication: this.application,
      children: states
    });

    const home: IDeckState = {
      name: 'home',
      abstract: true,
      children: [
        states.get('projects'),
        applications,
        states.get('infrastructure'),
        project,
        states.get('standaloneInstance'),
        states.get('standaloneSecurityGroup')
      ],
    };
    this.augmentChildren(home);
    stateHelperProvider.setNestedState(home);
  }

  public addStateConfig(config: IStateConfig) {
    if (!this.addedStates.get(config.parent)) {
      this.addedStates.set(config.parent, []);
    }
    this.addedStates.get(config.parent).push(config.state);
  }

  public setStates() {
    this.$urlRouterProvider.otherwise('/');
    this.$urlRouterProvider.when('/{path:.*}/', ['$match', ($match: IMatch) => `/${$match.path}`]);
    this.$urlRouterProvider.when('/applications/{application}', '/applications/{application}/clusters');
    this.$urlRouterProvider.when('/', '/infrastructure');
    this.$urlRouterProvider.when('/projects/{project}', '/projects/{project}/dashboard');
    this.$urlRouterProvider.when('/projects/{project}/applications/{application}', '/projects/{project}/applications/{application}/clusters');
  }

  public $get() { /* nothing */ }; // required for interface, which is required for .provider(...)
}

export const STATES_PROVIDER = 'spinnaker.core.navigation.states.provider';
module(STATES_PROVIDER, [
  require('angular-ui-router'),
  require('./stateHelper.provider.js'),
  require('../delivery/states.js'),
  require('../config/settings.js'),
  require('../cloudProvider/cloudProvider.registry.js'),
  require('../projects/project.controller.js'),
  require('../projects/dashboard/dashboard.controller.js'),
  require('../projects/service/project.read.service.js'),
  require('../overrideRegistry/override.registry.js'),
  APPLICATION_READ_SERVICE
])
  .provider('states', StatesProvider);
