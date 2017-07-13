import { mock, IScope, IQService } from 'angular';

import {
  CONFIGURE_PIPELINE_TEMPLATE_MODAL_CTRL,
  ConfigurePipelineTemplateModalController
} from './configurePipelineTemplateModal.controller';
import { IVariable } from './inputs/variableInput.service';
import { APPLICATION_MODEL_BUILDER, ApplicationModelBuilder } from 'core/application/applicationModel.builder';
import { Application } from 'core/application/application.model';
import { REACT_MODULE, ReactInjector } from 'core/reactShims';
import { PIPELINE_TEMPLATE_MODULE } from './pipelineTemplate.module';

describe('Controller: ConfigurePipelineTemplateModalCtrl', () => {
  let ctrl: ConfigurePipelineTemplateModalController,
    $scope: IScope,
    $q: IQService,
    application: Application;

  // Hard to get the right newline and space characters with template strings.
  const yaml = '- name: orca-test\n' +
               '  region: us-west-2\n' +
               '  availabilityZones: []\n' +
               '  capacity: 1\n' +
               '  keyPair: example-keypair\n' +
               '  loadBalancers:\n' +
               '   - orca-test\n' +
               '  securityGroups: []\n' +
               '  strategy: highlander\n' +
               '  instanceType: m3.xlarge';

  const template: any = {
    variables: [
      {
        name: 'credentials',
        group: 'Basic Settings',
        type: 'string',
        defaultValue: 'my-google-account',
      },
      {
        name: 'cloudProvider',
        group: 'Basic Settings',
        type: 'string',
        defaultValue: 'gce',
      },
      {
        name: 'someObject',
        group: 'Advanced Settings',
        type: 'object',
        defaultValue: yaml,
      },
      {
        name: 'someList',
        group: 'Advanced Settings',
        type: 'list',
        defaultValue: ['a', 'b', 'c'],
      },
      {
        name: 'someInt',
        type: 'int',
        defaultValue: 42,
      }
    ]
  };

  beforeEach(
    mock.module(
      APPLICATION_MODEL_BUILDER,
      CONFIGURE_PIPELINE_TEMPLATE_MODAL_CTRL,
      PIPELINE_TEMPLATE_MODULE,
      REACT_MODULE
    )
  );

  beforeEach(() => {
    mock.inject(($controller: ng.IControllerService, $rootScope: ng.IRootScopeService, _$q_: IQService, applicationModelBuilder: ApplicationModelBuilder) => {
      application = applicationModelBuilder.createStandaloneApplication('app');
      $scope = $rootScope.$new();
      $q = _$q_;
      ctrl = $controller('ConfigurePipelineTemplateModalCtrl', {
        $scope,
        application,
        $uibModalInstance: {close: $q.resolve(null)},
        pipelineTemplateConfig: {
          config: {
            pipeline: {
              name: 'My Managed Pipeline',
              template: {
                source: 'spinnaker://myPipelineId',
              }
            }
          }
        },
        pipelineId: '1234',
        isNew: true,
      }) as ConfigurePipelineTemplateModalController;
    });
  });


  describe('data initialization', () => {
    beforeEach(() => {
      spyOn(ReactInjector.pipelineTemplateService, 'getPipelineTemplateFromSourceUrl').and.callFake(() => {
        return $q.resolve(template);
      });
    });

    it('sets `variableMetadataGroups` on the controller, groups by variable metadata `groupName`', () => {
      ctrl.initialize();
      $scope.$digest();

      expect(ctrl.variableMetadataGroups).toBeDefined();
      expect(ctrl.variableMetadataGroups.length).toEqual(3);
      expect(ctrl.variableMetadataGroups.find(g => g.name === 'Basic Settings').variableMetadata.length).toEqual(2);
    });

    it('sets `variables` on the controller, each with a property `value` provided by variable metadata `defaultValue`', () => {
      ctrl.initialize();
      $scope.$digest();

      expect(ctrl.variables).toBeDefined();
      expect(ctrl.variables.length).toEqual(5);
      expect(ctrl.variables.map(v => v.value)).toEqual(['my-google-account', 'gce', yaml, ['a', 'b', 'c'], 42]);
    });

    it('initializes variables on controller with variables provided from the pipeline template config ', () => {
      const variables = {
        credentials: 'my-credentials',
        cloudProvider: 'gce',
        someObject: {key: 'value'},
        someList: ['a'],
        someInt: 123,
      };
      ctrl.pipelineTemplateConfig.config.pipeline.variables = variables;
      ctrl.initialize();
      $scope.$digest();

      expect(ctrl.variables.map(v => v.value)).toEqual([
        'my-credentials',
        'gce',
        'key: value\n',
        ['a'],
        123
      ]);
    });
  });

  describe('modal behavior if the underlying template changes', () => {
    let templateA: any, templateB: any;

    beforeEach(() => {
      templateA = {
        variables: [
          {
            name: 'letters',
            group: 'Basic Settings',
            type: 'list',
            defaultValue: ['a', 'b', 'c'],
          }
        ]
      };

      templateB = {
        variables: [
          {
            name: 'letters',
            group: 'Basic Settings',
            type: 'list',
            defaultValue: ['a', 'b', 'c'],
          },
          {
            name: 'numbers',
            group: 'Basic Settings',
            type: 'list',
            defaultValue: [1, 2, 3],
          }
        ]
      }
    });

    // This test should replicate the following steps:
    // 1). User creates and saves template config using the `templateA` template.
    // 2). User updates the template to add another variable (now the template is `templateB`).
    // 3). User reopens the config modal - the new variable should be initialized with its default value.
    it('initializes a new variable field with its default value', () => {
      const spy = spyOn(ReactInjector.pipelineTemplateService, 'getPipelineTemplateFromSourceUrl');
      spy.and.callFake(() => $q.resolve(templateA));

      ctrl.initialize();
      $scope.$digest();

      ctrl.pipelineTemplateConfig = ctrl.buildConfig();

      spy.and.callFake(() => $q.resolve(templateB));
      ctrl.initialize();
      $scope.$digest();

      expect(ctrl.buildConfig().config.pipeline.variables).toEqual({
        letters: ['a', 'b', 'c'],
        numbers: [1, 2, 3],
      });
    });

    // This test should replicate the following steps:
    // 1). User creates and saves template config using the `templateB` template.
    // 2). User updates the template to remove a variable (now the template is `templateA`).
    // 3). User reopens the config modal - on save, the removed variable should no longer exist in the config.
    it('prunes variables from the config if they no longer exist on the template', () => {
      const spy = spyOn(ReactInjector.pipelineTemplateService, 'getPipelineTemplateFromSourceUrl');
      spy.and.callFake(() => $q.resolve(templateB));

      ctrl.initialize();
      $scope.$digest();

      ctrl.pipelineTemplateConfig = ctrl.buildConfig();

      spy.and.callFake(() => $q.resolve(templateA));
      ctrl.initialize();
      $scope.$digest();

      expect(ctrl.buildConfig().config.pipeline.variables).toEqual({
        letters: ['a', 'b', 'c'],
      });
    });
  });

  describe('config creation', () => {
    beforeEach(() => {
      spyOn(ReactInjector.pipelineTemplateService, 'getPipelineTemplateFromSourceUrl').and.callFake(() => {
        return $q.resolve(template);
      });
    });

    it('builds map of variables', () => {
      ctrl.initialize();
      $scope.$digest();
      const templateConfig = ctrl.buildConfig();

      expect(templateConfig.config.pipeline.variables).toEqual({
        credentials: 'my-google-account',
        cloudProvider: 'gce',
        someObject: [{
          name: 'orca-test',
          region: 'us-west-2',
          availabilityZones: [],
          capacity: 1,
          keyPair: 'example-keypair',
          loadBalancers: ['orca-test'],
          securityGroups: [],
          strategy: 'highlander',
          instanceType: 'm3.xlarge'
        }],
        someList: ['a', 'b', 'c'],
        someInt: 42
      });
    });
  });

  describe('input validation', () => {
    const createVariable = (type: string, value: any): IVariable => {
      return {
        type,
        value,
        name: 'variableName'
      };
    };

    beforeEach(() => {
      spyOn(ReactInjector.pipelineTemplateService, 'getPipelineTemplateFromSourceUrl').and.callFake(() => {
        return $q.resolve(template);
      });
    });


    it('verifies that input variables are not empty', () => {
      ctrl.initialize();
      $scope.$digest();

      let v = createVariable('string', '');
      ctrl.handleVariableChange(v);
      expect(v.errors).toEqual([{message: 'Field is required.'}]);

      v = createVariable('object', '');
      ctrl.handleVariableChange(v);
      expect(v.errors).toEqual([{message: 'Field is required.'}]);

      v = createVariable('float', '');
      ctrl.handleVariableChange(v);
      expect(v.errors).toEqual([{message: 'Field is required.'}]);

      v = createVariable('int', '');
      ctrl.handleVariableChange(v);
      expect(v.errors).toEqual([{message: 'Field is required.'}]);

      v = createVariable('list', ['']);
      ctrl.handleVariableChange(v);
      expect(v.errors).toEqual([{message: 'Field is required.', key: 0}]);
    });

    it('validates yaml', () => {
      ctrl.initialize();
      $scope.$digest();

      let v = createVariable('object', yaml);
      ctrl.handleVariableChange(v);
      expect(v.errors.length).toEqual(0);

      const badYaml = `dropped: 'quote`;
      v = createVariable('object', badYaml);
      ctrl.handleVariableChange(v);
      expect(v.errors.length).toEqual(1);
    });
  });
});
