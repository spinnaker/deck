import {mock} from 'angular';

import {UNMATCHED_STAGE_TYPE_STAGE_CTRL, UnmatchedStageTypeStageCtrl} from './unmatchedStageTypeStage.controller';
import {JsonUtilityService} from 'core/utils/json/json.utility.service';

describe('Controller: UnmatchedStageTypeStageCtrl', () => {
  let ctrl: UnmatchedStageTypeStageCtrl;

  beforeEach(
    mock.module(
      UNMATCHED_STAGE_TYPE_STAGE_CTRL,
    )
  );

  beforeEach(() => {
    mock.inject(($controller: ng.IControllerService, $rootScope: ng.IRootScopeService, _jsonUtilityService_: JsonUtilityService) => {
      ctrl = $controller('UnmatchedStageTypeStageCtrl', {
        $scope: $rootScope.$new(),
        jsonUtilityService: _jsonUtilityService_
      }) as UnmatchedStageTypeStageCtrl;
      ctrl.$onInit();
    });
  });

  describe('Stage validation', () => {
    it('throws an error if the given JSON encoded string is not valid JSON', () => {
      ctrl.stageJson = `{
        "type": "upsertLoadBalancer",
        "comma-dangle": true,
      }`;
      ctrl.updateStage();
      expect(ctrl.errorMessage).toBeDefined();
    });

    it('throws an error if the given JSON encoded string does not include a `type` property.', () => {
      ctrl.stageJson = '{}';
      ctrl.updateStage();
      expect(ctrl.errorMessage).toBeDefined();
    });
  });

  describe('Stage key removal', () => {
    it('omits stage properties from JSON encoded string', () => {
      ctrl.$scope.stage = {
        refId: '1',
        requisiteStageRefIds: [],
        onFailure: 'fail',
      };
      ctrl.setStageJson();
      expect(ctrl.stageJson).toEqual('{}');
    });

    it('maintains the omitted stage properties when updating with new values from JSON encoded string', () => {
      ctrl.$scope.stage = {
        refId: '1',
        requisiteStageRefIds: [],
        onFailure: 'fail',
      };
      ctrl.stageJson = `{"type": "upsertLoadBalancer"}`;
      ctrl.updateStage();
      expect(ctrl.$scope.stage).toEqual({
        refId: '1',
        requisiteStageRefIds: [],
        onFailure: 'fail',
        type: 'upsertLoadBalancer',
      });
    });

    it('overrides the omitted stage properties with properties from the JSON encoded string', () => {
      ctrl.$scope.stage = {
        onFailure: 'fail',
      };
      ctrl.stageJson = `{"onFailure": "stop", "type": "upsertLoadBalancer"}`;
      ctrl.updateStage();
      expect(ctrl.$scope.stage).toEqual({
        onFailure: 'stop',
        type: 'upsertLoadBalancer',
      });
    });
  });
});
