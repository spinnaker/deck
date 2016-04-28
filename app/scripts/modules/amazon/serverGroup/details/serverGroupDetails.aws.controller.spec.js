'use strict';

describe('Controller: AWS ServerGroupDetailsCtrl', function () {
  var controller;
  var $scope;

  beforeEach(
    window.module(
      require('./serverGroupDetails.aws.controller'),
      require('../../../core/application/service/applications.read.service')
    )
  );

  beforeEach(
    window.inject( function($controller, $rootScope, applicationReader) {
      $scope = $rootScope.$new();
      let application = {};
      applicationReader.addSectionToApplication({key: 'serverGroups', lazy: true}, application);
      applicationReader.addSectionToApplication({key: 'loadBalancers', lazy: true}, application);
      controller = $controller('awsServerGroupDetailsCtrl', {
        $scope: $scope,
        app: application,
        serverGroup: {}
      });
    })
  );


  describe('Determine if a serverGroup is the only one in the Cluster', function () {

    it('should return true if the serverGroup is the only one in the Cluster', function () {

      var serverGroup = {
        cluster: 'foo',
        account: 'test',
        region: 'us-east-1',
      };


      var application = {
        clusters: [
          {
            name: 'foo',
            account: 'test',
            region: 'us-east-1',
            serverGroups: [serverGroup]
          }
        ]
      };

      var result = controller.isLastServerGroupInRegion(serverGroup, application );

      expect(result).toBe(true);
    });

    it('should return false if the serverGroup is NOT the only one in the Cluster', function () {

      var serverGroup = {
        cluster: 'foo'
      };


      var application = {
        clusters: [
          {
            name: 'foo',
            serverGroups: [serverGroup, serverGroup]
          }
        ]
      };

      var result = controller.isLastServerGroupInRegion(serverGroup, application );

      expect(result).toBe(false);
    });

    it('should return false if and error thrown', function () {

      var serverGroup = {};
      var application = {};

      var result = controller.isLastServerGroupInRegion(serverGroup, application );

      expect(result).toBe(false);
    });

  });




});
