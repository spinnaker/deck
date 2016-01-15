'use strict';

describe('azureServerGroupTransformer', function () {

  var transformer, azureVpcReader, $q, $scope;

  beforeEach(
    window.module(
      require('./serverGroup.transformer.js')
    )
  );

  beforeEach(function () {
    window.inject(function (_azureServerGroupTransformer_, _azureVpcReader_, _$q_, $rootScope) {
      transformer = _azureServerGroupTransformer_;
      azureVpcReader = _azureVpcReader_;
      $q = _$q_;
      $scope = $rootScope.$new();
    });
  });

  describe('normalize server group', function () {
    beforeEach(function() {
      spyOn(azureVpcReader, 'listVpcs').and.returnValue($q.when([
        {account: 'test', region: 'us-east-1', id: 'vpc-1', name: 'main'}
      ]));
    });

    it('adds vpc name to server group', function () {
      var serverGroup = {
        account: 'test',
        region: 'us-east-1',
        vpcId: 'vpc-1',
        instances: [],
      };
      transformer.normalizeServerGroup(serverGroup);
      $scope.$digest();
      expect(serverGroup.vpcName).toBe('main');
    });

    it('adds empty vpc name when no vpcId found on server group', function () {
      var serverGroup = {
        account: 'test',
        region: 'us-east-1',
        instances: [],
      };
      transformer.normalizeServerGroup(serverGroup);
      $scope.$digest();
      expect(serverGroup.vpcName).toBe('');
    });
  });

  describe('command transforms', function () {

    it('sets amiName from allImageSelection', function () {
      var command = {
        viewState: {
          mode: 'create',
          useAllImageSelection: true,
          allImageSelection: 'something-packagebase',
        },
        application: { name: 'theApp'}
      };

      var transformed = transformer.convertServerGroupCommandToDeployConfiguration(command);

      expect(transformed.amiName).toBe('something-packagebase');

    });

    it('removes subnetType property when null', function () {
      var command = {
        viewState: {
          mode: 'create',
          useAllImageSelection: true,
          allImageSelection: 'something-packagebase',
        },
        subnetType: null,
        application: { name: 'theApp'}
      };

      var transformed = transformer.convertServerGroupCommandToDeployConfiguration(command);
      expect(transformed.subnetType).toBe(undefined);

      command.subnetType = 'internal';
      transformed = transformer.convertServerGroupCommandToDeployConfiguration(command);
      expect(transformed.subnetType).toBe('internal');
    });

  });
});
