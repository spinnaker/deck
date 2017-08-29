import {mock} from 'angular';

import {API_SERVICE, Api} from 'core/api/api.service';
import {
  PIPELINE_CONFIG_SERVICE, PipelineConfigService
} from 'core/pipeline/config/services/pipelineConfig.service';
import {IStage} from 'core/domain/IStage';
import {IPipeline} from 'core/domain/IPipeline';

describe('pipelineConfigService', () => {

  let service: PipelineConfigService,
      $http: ng.IHttpBackendService,
      $scope: ng.IScope,
      API: Api;

  const buildStage = (base: any): IStage => {
    const stageDefaults: IStage = {
      name: 'a',
      type: 'wait',
      refId: null,
      isNew: false,
      requisiteStageRefIds: []
    };
    Object.assign(stageDefaults, base);

    return stageDefaults;
  };

  const buildPipeline = (base: any): IPipeline  => {
    const defaults: IPipeline = {
      id: null,
      index: 1,
      name: 'some pipeline',
      application: 'app',
      lastModifiedBy: null,
      limitConcurrent: true,
      keepWaitingPipelines: false,
      strategy: false,
      triggers: [],
      stages: [],
      parameterConfig: null,
    };

    if (base.stages && base.stages.length) {
      base.stages = base.stages.map((s: any) => buildStage(s));
    }

    Object.assign(defaults, base);

    return defaults;
  };

  beforeEach(
    mock.module(
      PIPELINE_CONFIG_SERVICE,
      API_SERVICE
    )
  );

  beforeEach(mock.inject((pipelineConfigService: PipelineConfigService, $httpBackend: ng.IHttpBackendService, $rootScope: ng.IRootScopeService, _API_: Api) => {
    service = pipelineConfigService;
    $http = $httpBackend;
    $scope = $rootScope.$new();
    API = _API_;
  }));

  describe('savePipeline', () => {
    it('clears isNew flags, stage name if not present', () => {
      const pipeline: IPipeline = buildPipeline({
        stages: [
          { name: 'explicit name', type: 'bake', isNew: true},
          { name: null, type: 'bake', isNew: true},
          { name: '', type: 'bake', isNew: true}
        ]
      });

      $http.expectPOST(API.baseUrl + '/pipelines').respond(200, '');

      service.savePipeline(pipeline);
      $scope.$digest();

      expect(pipeline.stages[0].name).toBe('explicit name');
      expect(pipeline.stages[1].name).toBeUndefined();
      expect(pipeline.stages[2].name).toBeUndefined();

      expect(pipeline.stages[0].isNew).toBeUndefined();
      expect(pipeline.stages[1].isNew).toBeUndefined();
      expect(pipeline.stages[2].isNew).toBeUndefined();
    });
  });

  describe('getPipelines', () => {
    it('should return pipelines sorted by index', () => {
      let result: IPipeline[] = null;
      const fromServer: IPipeline[] = [
        buildPipeline({ id: 'a', name: 'second', application: 'app', index: 1, stages: [], triggers: []}),
        buildPipeline({ id: 'b', name: 'last', application: 'app', index: 3, stages: [], triggers: []}),
        buildPipeline({ id: 'c', name: 'first', application: 'app', index: 0, stages: []}),
        buildPipeline({ id: 'd', name: 'third', application: 'app', index: 2, stages: []}),
      ];
      $http.expectGET(API.baseUrl + '/applications/app/pipelineConfigs').respond(200, fromServer);

      service.getPipelinesForApplication('app').then((pipelines: IPipeline[]) => {
        result = pipelines;
      });
      $scope.$digest();
      $http.flush();

      expect(result.map(r => r.name)).toEqual(['first', 'second', 'third', 'last']);
    });

    it('should fix sort order of pipelines on initialization: 0..n, index collisions sorted alphabetically', () => {
      const fromServer: IPipeline[] = [
        buildPipeline({ name: 'second', index: 1, stages: []}),
        buildPipeline({ name: 'last', index: 5, stages: []}),
        buildPipeline({ name: 'first', index: -3, stages: []}),
        buildPipeline({ name: 'duplicateIndex', index: 5, stages: []}),
      ];

      const posted: any[] = [];
      $http.expectGET(API.baseUrl + '/applications/app/pipelineConfigs').respond(200, fromServer);
      $http.whenPOST(API.baseUrl + '/pipelines', (data: string) => {
        const json: any = JSON.parse(data);
        posted.push({index: json.index, name: json.name});
        return true;
      }).respond(200, {});

      service.getPipelinesForApplication('app');
      $scope.$digest();
      $http.flush();

      expect(posted).toEqual([
        { name: 'first', index: 0 },
        { name: 'duplicateIndex', index: 2 },
        { name: 'last', index: 3 },
      ]);
    });
  });

  describe('stage dependencies', () => {
    let a: IStage, b: IStage, c: IStage, d: IStage;
    let pipeline: IPipeline;

    const connect = (child: IStage, parent: IStage) => {
      child.requisiteStageRefIds.push(parent.refId);
    };

    const expectCandidates = (test: IStage, expected: IStage[]) => {
      expect(service.getDependencyCandidateStages(pipeline, test)).toEqual(expected);
    };

    const expectDependencies = (test: IStage, expected: IStage[]) => {
      expect(service.getAllUpstreamDependencies(pipeline, test)).toEqual(expected);
    };

    beforeEach(() => {
      a = buildStage({refId: 1});
      b = buildStage({refId: 2});
      c = buildStage({refId: 3});
      d = buildStage({refId: 4});

      pipeline = buildPipeline({});
      pipeline.stages = [a, b, c, d];

    });

    describe('getAvailableUpstreamStages', () => {

      it('filters out provided stage', () => {
        expectCandidates(a, [b, c, d]);
        expectCandidates(b, [a, c, d]);
        expectCandidates(c, [a, b, d]);
        expectCandidates(d, [a, b, c]);
      });

      it('filters out direct dependent', () => {
        connect(b, a);
        expectCandidates(a, [c, d]);
      });

      it('filters out multiple direct dependents', () => {
        connect(b, a);
        connect(c, a);
        expectCandidates(a, [d]);
      });

      it('filters out existing upstream stages and indirect dependents', () => {
        connect(b, a);
        connect(c, b);
        expectCandidates(a, [d]);
        expectCandidates(b, [d]);
        expectCandidates(c, [a, d]);
        expectCandidates(d, [a, b, c]);
      });

      it('can depend on descendant stages of siblings', () => {
        connect(b, a);
        connect(c, b);
        connect(d, a);
        expectCandidates(a, []);
        expectCandidates(d, [b, c]);
      });
    });

    describe('getAllUpstreamDependencies', () => {
      it('returns an empty list when no dependencies exist', () => {
        expectDependencies(a, []);
        expectDependencies(b, []);
        expectDependencies(c, []);
        expectDependencies(d, []);
      });

      it('returns a single direct dependency', () => {
        connect(b, a);
        connect(c, a);

        expectDependencies(a, []);
        expectDependencies(b, [a]);
        expectDependencies(c, [a]);
        expectDependencies(d, []);
      });

      it('returns multiple direct dependencies', () => {
        connect(c, a);
        connect(c, b);

        expectDependencies(a, []);
        expectDependencies(b, []);
        expectDependencies(c, [a, b]);
        expectDependencies(d, []);
      });

      it('returns ancestor upstream dependencies', () => {
        connect(b, a);
        connect(c, b);
        connect(d, c);

        expectDependencies(a, []);
        expectDependencies(b, [a]);
        expectDependencies(c, [b, a]);
        expectDependencies(d, [c, b, a]);
      });

      it('returns ancestors: multiple direct dependencies', () => {
        connect(b, a);
        connect(c, a);
        connect(d, b);
        connect(d, c);

        expectDependencies(a, []);
        expectDependencies(b, [a]);
        expectDependencies(c, [a]);
        expectDependencies(d, [b, a, c]);
      });

      it('returns ancestors: multiple ancestor dependencies', () => {
        connect(c, a);
        connect(c, b);
        connect(d, c);

        expectDependencies(a, []);
        expectDependencies(b, []);
        expectDependencies(c, [a, b]);
        expectDependencies(d, [c, a, b]);

      });
    });
  });
});

