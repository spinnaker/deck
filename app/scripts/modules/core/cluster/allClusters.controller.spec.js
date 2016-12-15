import {APPLICATION_MODEL_BUILDER} from 'core/application/applicationModel.builder';

describe('Controller: AllClustersCtrl', function () {

  var controller;
  var scope;

  beforeEach(
    window.module(
      require('./allClusters.controller.js'),
      APPLICATION_MODEL_BUILDER
    )
  );

  beforeEach(
    window.inject(function ($rootScope, $controller, applicationModelBuilder) {
      scope = $rootScope.$new();
      let application = applicationModelBuilder.createApplication({key: 'serverGroups', lazy: true});
      controller = $controller('AllClustersCtrl', {
        $scope: scope,
        app: application,
      });
    })
  );

  it('should instantiate the controller', function () {
    expect(controller).toBeDefined();
  });
});


