import { mock } from 'angular';

import { SETTINGS } from 'core/config/settings';
import { ExecutionInformationService } from './executionInformation.service';

describe('Service: executionInformation', () => {
  let $httpBackend: ng.IHttpBackendService;
  const informationService = new ExecutionInformationService();
  const pipelines = [
    {
      application: 'gae',
      authentication: { allowedAccounts: [] },
      buildTime: 1546967562239,
      canceled: false,
      endTime: 1546967567617,
      id: '01D0Q77DZYFYY30D4YJ3BX3YAV',
      initialConfig: {},
      keepWaitingPipelines: false,
      limitConcurrent: true,
      name: 'Trigger from Cloud Build Subscription',
      notifications: [],
      origin: 'unknown',
      pipelineConfigId: '5a452958-7e81-48ba-9a4f-3433024562c4',
      stages: [
        {
          context: {},
          endTime: 1546967567594,
          id: '01D0Q77DZZ2NQKA65E73R48Z3P',
          name: 'Wait',
          outputs: {},
          refId: '1',
          requisiteStageRefIds: [],
          startTime: 1546967562427,
          status: 'SUCCEEDED',
          tasks: [],
          type: 'wait',
        },
      ],
      startTime: 1546967562380,
      status: 'SUCCEEDED',
      systemNotifications: [],
      trigger: {
        artifacts: [
          {
            name: 'gs://sbws/cloud-build-test/app.yaml',
            reference: 'gs://sbws/cloud-build-test/app.yaml',
            type: 'gcs/object',
            version: 'gs://sbws/cloud-build-test/app.yaml',
          },
          {
            name: 'gs://sbws/cloud-build-test/hello-go',
            reference: 'gs://sbws/cloud-build-test/hello-go',
            type: 'gcs/object',
            version: 'gs://sbws/cloud-build-test/hello-go',
          },
        ],
        attributeConstraints: {},
        dryRun: false,
        enabled: true,
        eventId: '295c5405-17f7-4702-be8b-1cfbd380aa97',
        id: '0a0ed3e9-fee1-35a9-8d28-0d2031326af2',
        notifications: [],
        parameters: {},
        payload: {
          artifacts: {
            objects: {
              location: 'gs://sbws/cloud-build-test/',
              paths: ['hello-go', 'app.yaml'],
              timing: { endTime: '2019-01-08T17:12:39.570390547Z', startTime: '2019-01-08T17:12:32.064227211Z' },
            },
          },
          createTime: '2019-01-08T17:12:19.990609553Z',
          finishTime: '2019-01-08T17:12:41.918002Z',
          id: '1c4b27fe-dbdf-45d1-9f47-8a1600958fbb',
          logUrl:
            'https://console.cloud.google.com/gcr/builds/1c4b27fe-dbdf-45d1-9f47-8a1600958fbb?project=564945042514',
          logsBucket: 'gs://564945042514.cloudbuild-logs.googleusercontent.com',
          options: { logging: 'LEGACY' },
          projectId: 'hebridean-sun',
          results: {
            artifactManifest: 'gs://sbws/cloud-build-test/artifacts-1c4b27fe-dbdf-45d1-9f47-8a1600958fbb.json',
            buildStepImages: ['sha256:2d7c28cebaf2f968e6d59783da94f302a55500bfb9761d2ec1f9135d9b0a17dd'],
            buildStepOutputs: [],
            numArtifacts: '2',
          },
          source: {
            storageSource: {
              bucket: 'hebridean-sun_cloudbuild',
              generation: '1546967539618409',
              object: 'source/1546967538.43-c9a83f59a30e4f23a8d918be414b2be6.tgz',
            },
          },
          sourceProvenance: {
            fileHashes: {
              'gs://hebridean-sun_cloudbuild/source/1546967538.43-c9a83f59a30e4f23a8d918be414b2be6.tgz#1546967539618409': {
                fileHash: [{ type: 'MD5', value: 'iRExlKjs6zmBv4ncpQnijw==' }],
              },
            },
            resolvedStorageSource: {
              bucket: 'hebridean-sun_cloudbuild',
              generation: '1546967539618409',
              object: 'source/1546967538.43-c9a83f59a30e4f23a8d918be414b2be6.tgz',
            },
          },
          startTime: '2019-01-08T17:12:22.281821066Z',
          status: 'SUCCESS',
          steps: [
            {
              args: ['build', '-o', 'hello-go', './main.go'],
              env: ['PROJECT_ROOT=hello', 'HELLO_GO_PORT=8080', 'HELLO_GO_HOST="0.0.0.0"'],
              name: 'gcr.io/cloud-builders/go',
              pullTiming: {
                endTime: '2019-01-08T17:12:27.227558365Z',
                startTime: '2019-01-08T17:12:27.167723607Z',
              },
              status: 'SUCCESS',
              timing: { endTime: '2019-01-08T17:12:30.350451046Z', startTime: '2019-01-08T17:12:27.167723607Z' },
            },
          ],
          timeout: '600s',
          timing: {
            BUILD: { endTime: '2019-01-08T17:12:30.399391775Z', startTime: '2019-01-08T17:12:27.167708159Z' },
            FETCHSOURCE: { endTime: '2019-01-08T17:12:27.113921859Z', startTime: '2019-01-08T17:12:24.328205429Z' },
            PUSH: { endTime: '2019-01-08T17:12:41.309544975Z', startTime: '2019-01-08T17:12:30.399405809Z' },
          },
        },
        payloadConstraints: { status: 'SUCCESS' },
        pubsubSystem: 'google',
        rebake: false,
        resolvedExpectedArtifacts: [
          {
            boundArtifact: {
              name: 'gs://sbws/cloud-build-test/app.yaml',
              reference: 'gs://sbws/cloud-build-test/app.yaml',
              type: 'gcs/object',
              version: 'gs://sbws/cloud-build-test/app.yaml',
            },
            defaultArtifact: {},
            id: 'ba157234-4127-4b05-a037-729f98faeb20',
            matchArtifact: { name: 'gs://sbws/cloud-build-test/app.yaml', type: 'gcs/object' },
            useDefaultArtifact: false,
            usePriorArtifact: false,
          },
        ],
        status: [],
        strategy: false,
        subscriptionName: 'hebridean-sun-cloud-builds',
        type: 'pubsub',
        user: '[anonymous]',
      },
      type: 'PIPELINE',
    },
  ];
  const pipelineConfigs = [
    {
      application: 'gae',
      expectedArtifacts: [
        {
          defaultArtifact: {
            id: '50ca1cd7-d926-401b-8794-28a779fb0de5',
            kind: 'default.docker',
            name: 'gcr.io/hebridean-sun/hello-go',
            reference: 'gcr.io/hebridean-sun/hello-go',
            type: 'docker/image',
          },
          id: '4230d4a3-6255-46ac-bbb2-28c4668f5740',
          matchArtifact: {
            id: 'be089af6-45c4-4f67-b937-1eea60595da0',
            kind: 'docker',
            name: 'gcr.io/hebridean-sun/hello-go',
            type: 'docker/image',
          },
          useDefaultArtifact: true,
          usePriorArtifact: false,
        },
        {
          defaultArtifact: {
            id: '1bbeeaac-e171-4f83-bb73-307eab8600b6',
            kind: 'default.gcs',
            name: 'gs://sbws/appengine/app.yaml',
            reference: 'gs://sbws/appengine/app.yaml',
            type: 'gcs/object',
          },
          id: 'f70ec87a-2aff-49c1-b0c2-0e4dfb110c78',
          matchArtifact: {
            id: '61818beb-71a2-4399-80fe-f17f2c24cf57',
            kind: 'gcs',
            name: 'gs://sbws/appengine/app.yaml',
            type: 'gcs/object',
          },
          useDefaultArtifact: true,
          usePriorArtifact: false,
        },
      ],
      id: 'c2b04706-1d72-4ad1-ae04-5d5ee0d66749',
      index: 0,
      keepWaitingPipelines: false,
      lastModifiedBy: 'anonymous',
      limitConcurrent: true,
      name: 'Deploy a Container',
      stages: [
        {
          clusters: [
            {
              account: 'gae',
              application: 'gae',
              cloudProvider: 'appengine',
              configArtifacts: [{ account: 'hebridean-sun-local-gcs', id: 'f70ec87a-2aff-49c1-b0c2-0e4dfb110c78' }],
              configFiles: [],
              expectedArtifactId: '4230d4a3-6255-46ac-bbb2-28c4668f5740',
              freeFormDetails: 'test1detail',
              fromArtifact: true,
              gitCredentialType: 'NONE',
              interestingHealthProviderNames: [],
              promote: true,
              provider: 'appengine',
              region: 'us-central',
              sourceType: 'containerImage',
              stack: 'test1stack',
              stopPreviousVersion: false,
            },
          ],
          name: 'Deploy',
          refId: '1',
          requisiteStageRefIds: [],
          type: 'deploy',
        },
      ],
      triggers: [],
      updateTs: '1540558574772',
    },
  ];

  beforeEach(
    mock.inject(function(_$httpBackend_: ng.IHttpBackendService) {
      $httpBackend = _$httpBackend_;
    }),
  );

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('function getExecution', () => {
    xit('should return the execution by id', () => {
      const executionId = '01D0Q77DZYFYY30D4YJ3BX3YAV';
      const url = [SETTINGS.gateUrl, 'pipelines', executionId].join('/');
      const execution = {};
      let actual;
      let suceeded = false;

      $httpBackend.expectGET(url).respond(200, pipelines);
      informationService.getExecution(executionId).then(result => {
        actual = result;
        suceeded = true;
      });
      expect(suceeded).toBe(true);
      $httpBackend.flush();

      expect(actual).toEqual(execution);
    });
  });

  describe('function getPipelineConfig', () => {
    xit('should return the pipeline config by application and pipeline id', () => {
      const application = 'gae';
      const pipelineConfigId = '5a452958-7e81-48ba-9a4f-3433024562c4';
      const url = [SETTINGS.gateUrl, 'applications', application, 'pipelineConfigs'].join('/');
      let actual;
      let suceeded = false;

      $httpBackend.expectGET(url).respond(200, pipelineConfigs);
      informationService.getPipelineConfig(application, pipelineConfigId).then(result => {
        actual = result;
        suceeded = true;
      });
      expect(suceeded).toBe(true);
      $httpBackend.flush();

      expect(actual).toEqual(actual);
    });
  });
});
