import { IHttpBackendService, mock } from 'angular';
import { find } from 'lodash';

import { ClusterFilterModel } from './filter/clusterFilter.model';
import { CLUSTER_SERVICE, ClusterService } from './cluster.service';
import { APPLICATION_MODEL_BUILDER, ApplicationModelBuilder } from 'core/application/applicationModel.builder';
import { IInstanceCounts, IServerGroup } from 'core/domain';
import { Application } from 'core/application/application.model';
import { Api } from '../api/api.service';

describe('Service: Cluster', function () {
  beforeEach(
    mock.module(CLUSTER_SERVICE, APPLICATION_MODEL_BUILDER)
  );

  let clusterService: ClusterService;
  let clusterFilterModel: ClusterFilterModel;
  let $http: IHttpBackendService;
  let API: Api;
  let application: Application;

  function buildTask(config: {status: string, variables: {[key: string]: any}}) {
    return {
      status: config.status,
      getValueFor: (key: string): any => {
        return find(config.variables, { key: key }) ? find(config.variables, { key: key }).value : null;
      }
    };
  }

  beforeEach(mock.inject(($httpBackend: IHttpBackendService, _API_: Api, _clusterFilterModel_: ClusterFilterModel,
                          _clusterService_: ClusterService, applicationModelBuilder: ApplicationModelBuilder) => {
    $http = $httpBackend;
    API = _API_;
    clusterService = _clusterService_;
    clusterFilterModel = _clusterFilterModel_;

    application = applicationModelBuilder.createApplication(
      'app',
      {key: 'serverGroups'},
      {key: 'runningExecutions'},
      {key: 'runningTasks'}
    );
    application.getDataSource('serverGroups').data = [
        {name: 'the-target', account: 'not-the-target', region: 'us-east-1'},
        {name: 'the-target', account: 'test', region: 'not-the-target'},
        {name: 'the-target', account: 'test', region: 'us-east-1'},
        {name: 'not-the-target', account: 'test', region: 'us-east-1'},
        {name: 'the-source', account: 'test', region: 'us-east-1'}
      ];
  }));

  describe('lazy cluster fetching', () => {
    it('switches to lazy cluster fetching if there are more than 250 clusters', () => {
      const clusters = Array(251);
      $http.expectGET(API.baseUrl + '/applications/app/clusters').respond(200, {test: clusters});
      $http.expectGET(API.baseUrl + '/applications/app/serverGroups?clusters=').respond(200, []);
      let serverGroups: IServerGroup[] = null;
      clusterService.loadServerGroups(application).then((result: IServerGroup[]) => serverGroups = result);
      $http.flush();
      expect(application.serverGroups.fetchOnDemand).toBe(true);
      expect(serverGroups).toEqual([]);
    });

    it('does boring regular fetching when there are less than 251 clusters', () => {
      const clusters = Array(250);
      $http.expectGET(API.baseUrl + '/applications/app/clusters').respond(200, {test: clusters});
      $http.expectGET(API.baseUrl + '/applications/app/serverGroups').respond(200, []);
      let serverGroups: IServerGroup[] = null;
      clusterService.loadServerGroups(application).then((result: IServerGroup[]) => serverGroups = result);
      $http.flush();
      expect(application.serverGroups.fetchOnDemand).toBe(false);
      expect(serverGroups).toEqual([]);
    });

    it('converts clusters parameter to q and account params when there are fewer than 251 clusters', () => {
      spyOn(clusterFilterModel.asFilterModel, 'applyParamsToUrl').and.callFake(() => {});
      const clusters = Array(250);
      clusterFilterModel.asFilterModel.sortFilter.clusters = {'test:myapp': true};
      $http.expectGET(API.baseUrl + '/applications/app/clusters').respond(200, {test: clusters});
      $http.expectGET(API.baseUrl + '/applications/app/serverGroups').respond(200, []);
      let serverGroups: IServerGroup[] = null;
      clusterService.loadServerGroups(application).then((result: IServerGroup[]) => serverGroups = result);
      $http.flush();
      expect(application.serverGroups.fetchOnDemand).toBe(false);
      expect(clusterFilterModel.asFilterModel.sortFilter.filter).toEqual('clusters:myapp');
      expect(clusterFilterModel.asFilterModel.sortFilter.account.test).toBe(true);
    });
  });

  describe('health count rollups', () => {
    it('aggregates health counts from server groups', () => {
      application.serverGroups.data = [
          {cluster: 'cluster-a', name: 'cluster-a-v001', account: 'test', region: 'us-east-1', instances: [], instanceCounts: {total: 1, up: 1} },
          {cluster: 'cluster-a', name: 'cluster-a-v001', account: 'test', region: 'us-west-1', instances: [], instanceCounts: {total: 2, down: 2} },
          {cluster: 'cluster-b', name: 'cluster-b-v001', account: 'test', region: 'us-east-1', instances: [], instanceCounts: {total: 1, starting: 1} },
          {cluster: 'cluster-b', name: 'cluster-b-v001', account: 'test', region: 'us-west-1', instances: [], instanceCounts: {total: 1, outOfService: 1} },
          {cluster: 'cluster-b', name: 'cluster-b-v002', account: 'test', region: 'us-west-1', instances: [], instanceCounts: {total: 2, unknown: 1, outOfService: 1} },
        ];

      const clusters = clusterService.createServerGroupClusters(application.serverGroups.data);
      const cluster0counts: IInstanceCounts = clusters[0].instanceCounts;
      const cluster1counts: IInstanceCounts = clusters[1].instanceCounts;
      expect(clusters.length).toBe(2);
      expect(cluster0counts.total).toBe(3);
      expect(cluster0counts.up).toBe(1);
      expect(cluster0counts.down).toBe(2);
      expect(cluster0counts.starting).toBe(0);
      expect(cluster0counts.outOfService).toBe(0);
      expect(cluster0counts.unknown).toBe(0);

      expect(cluster1counts.total).toBe(4);
      expect(cluster1counts.up).toBe(0);
      expect(cluster1counts.down).toBe(0);
      expect(cluster1counts.starting).toBe(1);
      expect(cluster1counts.outOfService).toBe(2);
      expect(cluster1counts.unknown).toBe(1);

    });
  });

  describe('addTasksToServerGroups', () => {
    describe('rollback tasks', function () {
      it('attaches to source and target', function () {
        application.runningTasks.data = [
          buildTask({status: 'RUNNING', variables: [
            { key: 'credentials', value: 'test' },
            { key: 'regions', value: ['us-east-1'] },
            { key: 'targetop.asg.disableServerGroup.name', value: 'the-source' },
            { key: 'targetop.asg.enableServerGroup.name', value: 'the-target' }
          ]})
        ];

        application.runningTasks.data[0].execution = {stages: [ { type: 'rollbackServerGroup', context: {} }] };
        clusterService.addTasksToServerGroups(application);
        const serverGroups: IServerGroup[] = application.serverGroups.data;
        expect(serverGroups[0].runningTasks.length).toBe(0);
        expect(serverGroups[1].runningTasks.length).toBe(0);
        expect(serverGroups[2].runningTasks.length).toBe(1);
        expect(serverGroups[3].runningTasks.length).toBe(0);
        expect(serverGroups[4].runningTasks.length).toBe(1);
      });
    });

    describe('createcopylastasg tasks', () => {
      it('attaches to source and target', () => {
        application.runningTasks.data = [
          buildTask({status: 'RUNNING', variables: [
            { key: 'notification.type', value: 'createcopylastasg'},
            { key: 'deploy.account.name', value: 'test'},
            { key: 'availabilityZones', value: {'us-east-1': ['a']}},
            { key: 'deploy.server.groups', value: {'us-east-1': ['the-target']}},
            { key: 'source', value: { asgName: 'the-source', account: 'test', region: 'us-east-1'}}
          ]})
        ];

        clusterService.addTasksToServerGroups(application);
        const serverGroups: IServerGroup[] = application.serverGroups.data;
        expect(serverGroups[0].runningTasks.length).toBe(0);
        expect(serverGroups[1].runningTasks.length).toBe(0);
        expect(serverGroups[2].runningTasks.length).toBe(1);
        expect(serverGroups[3].runningTasks.length).toBe(0);
        expect(serverGroups[4].runningTasks.length).toBe(1);
      });

      it('still attaches to source when target not found', () => {
        application.runningTasks.data = [
          buildTask({status: 'RUNNING', variables: [
            { key: 'notification.type', value: 'createcopylastasg'},
            { key: 'deploy.account.name', value: 'test'},
            { key: 'availabilityZones', value: {'us-east-1': ['a']}},
            { key: 'deploy.server.groups', value: {'us-east-1': ['not-found-target']}},
            { key: 'source', value: { asgName: 'the-source', account: 'test', region: 'us-east-1'}}
          ]})
        ];

        clusterService.addTasksToServerGroups(application);
        const serverGroups: IServerGroup[] = application.serverGroups.data;
        expect(serverGroups[0].runningTasks.length).toBe(0);
        expect(serverGroups[1].runningTasks.length).toBe(0);
        expect(serverGroups[2].runningTasks.length).toBe(0);
        expect(serverGroups[3].runningTasks.length).toBe(0);
        expect(serverGroups[4].runningTasks.length).toBe(1);
      });
    });

    describe('createdeploy', () => {
      it('attaches to deployed server group', () => {
        application.runningTasks.data = [
          buildTask({status: 'RUNNING', variables: [
            { key: 'notification.type', value: 'createdeploy'},
            { key: 'deploy.account.name', value: 'test'},
            { key: 'deploy.server.groups', value: {'us-east-1': ['the-target']}},
          ]})
        ];

        clusterService.addTasksToServerGroups(application);
        const serverGroups: IServerGroup[] = application.serverGroups.data;
        expect(serverGroups[0].runningTasks.length).toBe(0);
        expect(serverGroups[1].runningTasks.length).toBe(0);
        expect(serverGroups[2].runningTasks.length).toBe(1);
        expect(serverGroups[3].runningTasks.length).toBe(0);
        expect(serverGroups[4].runningTasks.length).toBe(0);
      });

      it('does nothing when target not found', () => {
        application.runningTasks.data = [
          buildTask({status: 'RUNNING', variables: [
            { key: 'notification.type', value: 'createdeploy'},
            { key: 'deploy.account.name', value: 'test'},
            { key: 'deploy.server.groups', value: {'us-east-1': ['not-found-target']}},
          ]})
        ];

        clusterService.addTasksToServerGroups(application);
        const serverGroups: IServerGroup[] = application.serverGroups.data;
        expect(serverGroups[0].runningTasks.length).toBe(0);
        expect(serverGroups[1].runningTasks.length).toBe(0);
        expect(serverGroups[2].runningTasks.length).toBe(0);
        expect(serverGroups[3].runningTasks.length).toBe(0);
        expect(serverGroups[4].runningTasks.length).toBe(0);
      });
    });

    describe('can find task in server groups by instance id', () => {
      [
        'terminateinstances', 'rebootinstances',
        'registerinstanceswithloadbalancer', 'deregisterinstancesfromloadbalancer',
        'enableinstancesindiscovery', 'disableinstancesindiscovery'
        ].forEach((name) => {
        describe(name, () => {
          it ('finds instance within server group (' + name + ')', () => {
            const serverGroups: IServerGroup[] = application.serverGroups.data;
            serverGroups[2].instances = [
              { id: 'in-1', health: null, launchTime: 1, zone: null },
              { id: 'in-2', health: null, launchTime: 1, zone: null },
            ];
            serverGroups[4].instances = [
              { id: 'in-3', health: null, launchTime: 1, zone: null},
              { id: 'in-2', health: null, launchTime: 1, zone: null},
            ];
            application.runningTasks.data = [
              buildTask({status: 'RUNNING', variables: [
                { key: 'notification.type', value: name},
                { key: 'credentials', value: 'test'},
                { key: 'region', value: 'us-east-1'},
                { key: 'instanceIds', value: ['in-2']}
              ]})
            ];

            clusterService.addTasksToServerGroups(application);
            expect(serverGroups[0].runningTasks.length).toBe(0);
            expect(serverGroups[1].runningTasks.length).toBe(0);
            expect(serverGroups[2].runningTasks.length).toBe(1);
            expect(serverGroups[3].runningTasks.length).toBe(0);
            expect(serverGroups[4].runningTasks.length).toBe(1);
          });
        });
      });
    });

    describe('resizeasg, disableasg, destroyasg, enableasg', () => {
      beforeEach(() => {
        this.validateTaskAttached = () => {
          clusterService.addTasksToServerGroups(application);
          const serverGroups: IServerGroup[] = application.serverGroups.data;
          expect(serverGroups[0].runningTasks.length).toBe(0);
          expect(serverGroups[1].runningTasks.length).toBe(0);
          expect(serverGroups[2].runningTasks.length).toBe(1);
          expect(serverGroups[3].runningTasks.length).toBe(0);
          expect(serverGroups[4].runningTasks.length).toBe(0);
        };

        this.buildCommonTask = (type: string) => {
          application.runningTasks = {data: [
            buildTask({status: 'RUNNING', variables: [
              { key: 'notification.type', value: type},
              { key: 'credentials', value: 'test'},
              { key: 'regions', value: ['us-east-1']},
              { key: 'asgName', value: 'the-target'},
            ]})
          ]};
        };
      });

      it('resizeasg', () => {
        this.buildCommonTask('resizeasg');
        this.validateTaskAttached();
      });

      it('disableasg', () => {
        this.buildCommonTask('resizeasg');
        this.validateTaskAttached();
      });

      it('destroyasg', () => {
        this.buildCommonTask('resizeasg');
        this.validateTaskAttached();
      });

      it('enableasg', () => {
        this.buildCommonTask('resizeasg');
        this.validateTaskAttached();
      });

      it('some unknown task', () => {
        this.buildCommonTask('someuknownthing');
        clusterService.addTasksToServerGroups(application);
        application.serverGroups.data.forEach((serverGroup: IServerGroup) => {
          expect(serverGroup.runningTasks.length).toBe(0);
        });
      });
    });


    describe('extraction region from stage context', function () {

      it('should return the region from the deploy.server.groups node', function () {

        const context = {
          'deploy.server.groups':  {
            'us-west-1': ['mahe-prestaging-v001']
          }
        };

        const result = clusterService.extractRegionFromContext(context);
        expect(result).toBe('us-west-1');

      });


      it('should return empty string if nothing is extracted', function () {
        const context = {};

        const result = clusterService.extractRegionFromContext(context);

        expect(result).toBe('');
      });

    });


    describe('add executions to server group for deploy stage', function () {
      beforeEach(() => {
        application.serverGroups.data = [
          {
            name: 'foo-v001',
            account: 'test',
            region: 'us-west-1'
          }
        ];
      });

      it('should successfully add a matched execution to a server group', function () {
        const executions = [
          {
            stages: [
              {
                type: 'deploy',
                context: {
                  'deploy.server.groups':  {
                    'us-west-1': ['foo-v001']
                  },
                  account: 'test',
                }
              }
            ]
          }
        ];

        application.runningExecutions.data = executions;
        clusterService.addExecutionsToServerGroups(application);

        expect(application.serverGroups.data[0].runningExecutions.length).toBe(1);
      });


      it('should NOT add a execution to a server group if the region does not match', function () {
        const executions = [
          {
            stages: [
              {
                type: 'deploy',
                context: {
                  'deploy.server.groups':  {
                    'us-east-1': ['foo-v001']
                  },
                  account: 'test',
                }
              }
            ]
          }
        ];

        application.runningExecutions.data = executions;
        clusterService.addExecutionsToServerGroups(application);

        expect(application.serverGroups.data[0].runningExecutions.length).toBe(0);
      });


      it('should NOT add a execution to a server group if the account does not match', function () {
        const executions = [
          {
            stages: [
              {
                type: 'deploy',
                context: {
                  'deploy.server.groups':  {
                    'us-west-1': ['foo-v001']
                  },
                  account: 'prod',
                }
              }
            ]
          }
        ];

        application.runningExecutions.data = executions;
        clusterService.addExecutionsToServerGroups(application);

        expect(application.serverGroups.data[0].runningExecutions.length).toBe(0);
      });
    });


    describe('add executions to server group for disableAsg stage', function () {
      beforeEach(() => {
        application.serverGroups.data = [
          {
            name: 'foo-v001',
            account: 'test',
            region: 'us-west-1'
          }
        ];
      });

      it('should successfully add a matched execution to a server group', function () {
        const executions = [
          {
            stages: [
              {
                type: 'disableAsg',
                context: {
                  'targetop.asg.disableAsg.name': 'foo-v001',
                  'targetop.asg.disableAsg.regions': ['us-west-1'],
                  credentials: 'test',
                }
              }
            ]
          }
        ];

        application.runningExecutions.data = executions;
        clusterService.addExecutionsToServerGroups(application);

        expect(application.serverGroups.data[0].runningExecutions.length).toBe(1);
      });


      it('should NOT add a execution to a server group if the region does not match', function () {
        const executions = [
          {
            stages: [
              {
                type: 'disableAsg',
                context: {
                  'targetop.asg.disableAsg.name': 'foo-v001',
                  'targetop.asg.disableAsg.regions': ['us-east-1'],
                  credentials: 'test',
                }
              }
            ]
          }
        ];

        application.runningExecutions.data = executions;
        clusterService.addExecutionsToServerGroups(application);

        expect(application.serverGroups.data[0].runningExecutions.length).toBe(0);
      });


      it('should NOT add a execution to a server group if the account does not match', function () {
        const executions = [
          {
            stages: [
              {
                type: 'deploy',
                context: {
                  'targetop.asg.disableAsg.name': 'foo-v001',
                  'targetop.asg.disableAsg.regions': ['us-west-1'],
                  credentials: 'prod',
                }
              }
            ]
          }
        ];

        application.runningExecutions.data = executions;
        clusterService.addExecutionsToServerGroups(application);

        expect(application.serverGroups.data[0].runningExecutions.length).toBe(0);
      });
    });
  });
});
