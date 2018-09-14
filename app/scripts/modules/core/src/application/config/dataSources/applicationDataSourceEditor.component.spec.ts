import { mock } from 'angular';

import { Application } from 'core/application/application.model';
import { APPLICATION_MODEL_BUILDER, ApplicationModelBuilder } from 'core/application/applicationModel.builder';
import { APPLICATION_DATA_SOURCE_EDITOR, DataSourceEditorController } from './applicationDataSourceEditor.component';
import { ApplicationWriter } from 'core/application/service/ApplicationWriter';

describe('Component: Application Data Source Editor', () => {
  let applicationModelBuilder: ApplicationModelBuilder,
    application: Application,
    $componentController: ng.IComponentControllerService,
    ctrl: DataSourceEditorController,
    $q: ng.IQService,
    $scope: ng.IScope;

  const initialize = () => {
    ctrl = $componentController(
      'applicationDataSourceEditor',
      { $scope: null },
      { application },
    ) as DataSourceEditorController;
    ctrl.$onInit();
  };

  beforeEach(mock.module(APPLICATION_DATA_SOURCE_EDITOR, APPLICATION_MODEL_BUILDER));

  beforeEach(
    mock.inject(
      (
        _applicationModelBuilder_: ApplicationModelBuilder,
        _$componentController_: ng.IComponentControllerService,
        _$q_: ng.IQService,
        $rootScope: ng.IRootScopeService,
      ) => {
        applicationModelBuilder = _applicationModelBuilder_;
        $componentController = _$componentController_;
        $q = _$q_;
        $scope = $rootScope.$new();
      },
    ),
  );

  beforeEach(() => {
    application = applicationModelBuilder.createApplicationForTests(
      'app',
      {
        key: 'optionalSource',
        optional: true,
        visible: true,
      },
      {
        key: 'invisibleSource',
        visible: false,
      },
      {
        key: 'requiredSource',
        visible: true,
      },
      {
        key: 'optInSource',
        optional: true,
        visible: true,
        optIn: true,
      },
    );
    application.getDataSource('optInSource').disabled = true;
    application.attributes = { accounts: ['test'] };
  });

  describe('model initialization', () => {
    it('uses data source configuration if no dataSources attribute present on application', () => {
      initialize();
      expect(ctrl.model).toEqual({
        optionalSource: true,
        optInSource: false,
      });
    });

    it('marks explicitly disabled sources from application data sources', () => {
      application.getDataSource('optionalSource').disabled = true;
      initialize();
      expect(ctrl.model).toEqual({
        optionalSource: false,
        optInSource: false,
      });
    });

    it('marks explicitly enabled opt-in sources from application data sources', () => {
      application.getDataSource('optInSource').disabled = false;
      initialize();
      expect(ctrl.model).toEqual({
        optionalSource: true,
        optInSource: true,
      });
    });
  });

  describe('toggling options', () => {
    it('sets isDirty flag when option changes', () => {
      initialize();
      ctrl.model.optInSource = true;
      ctrl.dataSourceChanged('optInSource');
      expect(ctrl.isDirty).toBe(true);
      ctrl.model.optInSource = false;
      ctrl.dataSourceChanged('optInSource');
      expect(ctrl.isDirty).toBe(false);
    });

    it('adds field to explicitlyEnabled/Disabled when toggled', () => {
      initialize();
      expect(ctrl.explicitlyEnabled).toEqual([]);
      expect(ctrl.explicitlyDisabled).toEqual([]);

      ctrl.model.optInSource = true;
      ctrl.dataSourceChanged('optInSource');
      expect(ctrl.explicitlyEnabled).toEqual(['optInSource']);
      expect(ctrl.explicitlyDisabled).toEqual([]);

      ctrl.model.optInSource = false;
      ctrl.dataSourceChanged('optInSource');
      expect(ctrl.explicitlyEnabled).toEqual([]);
      expect(ctrl.explicitlyDisabled).toEqual(['optInSource']);
    });
  });

  describe('save', () => {
    it('sets state flags, saves, then updates existing data sources and refreshes application', () => {
      spyOn(ApplicationWriter, 'updateApplication').and.returnValue($q.when());
      spyOn(application, 'refresh').and.returnValue(null);
      initialize();
      expect(ctrl.saving).toBe(false);

      ctrl.model.optInSource = true;
      ctrl.dataSourceChanged('optInSource');
      ctrl.model.optionalSource = false;
      ctrl.dataSourceChanged('optionalSource');
      ctrl.save();

      expect(ctrl.isDirty).toBe(true);
      expect(ctrl.saving).toBe(true);
      expect((ApplicationWriter.updateApplication as any).calls.mostRecent().args[0]).toEqual({
        name: 'app',
        accounts: ['test'],
        dataSources: { enabled: ['optInSource'], disabled: ['optionalSource'] },
      });

      $scope.$digest();
      expect(ctrl.saving).toBe(false);
      expect(ctrl.isDirty).toBe(false);
      expect(application.attributes.dataSources.enabled).toEqual(['optInSource']);
      expect(application.attributes.dataSources.disabled).toEqual(['optionalSource']);
      expect((application.refresh as any).calls.count()).toEqual(1);
    });

    it('sets error flag when save fails', () => {
      spyOn(ApplicationWriter, 'updateApplication').and.returnValue($q.reject());
      spyOn(application, 'refresh');
      initialize();
      expect(ctrl.saving).toBe(false);
      expect(ctrl.saveError).toBe(false);

      ctrl.save();
      expect(ctrl.saving).toBe(true);

      $scope.$digest();
      expect(ctrl.saving).toBe(false);
      expect(ctrl.saveError).toBe(true);
    });
  });
});
