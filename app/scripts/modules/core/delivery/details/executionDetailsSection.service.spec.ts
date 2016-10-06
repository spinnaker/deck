import {ExecutionDetailsSectionService} from './executionDetailsSection.service';

describe('executionDetailsSectionService', function() {

  let $state: angular.ui.IStateService,
      $stateParams: angular.ui.IStateParamsService,
      $timeout: ng.ITimeoutService,
      service: ExecutionDetailsSectionService;

  beforeEach(angular.mock.module('spinnaker.executionDetails.section.service'));

  beforeEach(angular.mock.inject((
    executionDetailsSectionService: ExecutionDetailsSectionService,
    _$state_: angular.ui.IStateService,
    _$stateParams_: angular.ui.IStateParamsService,
    _$timeout_: ng.ITimeoutService) => {

      service = executionDetailsSectionService;
      $state = _$state_;
      $stateParams = _$stateParams_;
      $timeout = _$timeout_;

    }
  ));

  describe('synchronizeSection', () => {
    it('does nothing when state is not in execution details', function() {
      spyOn($state, 'includes').and.returnValue(false);
      spyOn($state, 'go');

      service.synchronizeSection(['a', 'b']);

      expect($state.includes).toHaveBeenCalledWith('**.execution');
      expect($state.go).not.toHaveBeenCalled();
    });

    it('reuses current section if still valid', function() {
      spyOn($state, 'includes').and.returnValue(true);
      spyOn($state, 'go');

      $stateParams['details'] = 'b';

      service.synchronizeSection(['a', 'b']);

      expect($state.includes).toHaveBeenCalledWith('**.execution');
      expect($state.go).not.toHaveBeenCalled();
    });

    it('replaces current section if not valid', function() {
      spyOn($state, 'includes').and.returnValue(true);
      spyOn($state, 'go');

      $stateParams['details'] = 'c';

      service.synchronizeSection(['a', 'b']);

      expect($state.includes).toHaveBeenCalledWith('**.execution');
      expect($state.go).toHaveBeenCalledWith('.', { details: 'a'}, {location: 'replace'});
    });


    it('uses first section if none present in state params', function() {
      spyOn($state, 'includes').and.returnValue(true);
      spyOn($state, 'go');

      $stateParams['details'] = undefined;

      service.synchronizeSection(['a', 'b']);

      expect($state.includes).toHaveBeenCalledWith('**.execution');
      expect($state.go).toHaveBeenCalledWith('.', { details: 'a'}, {location: 'replace'});
    });

    it('calls initialization after timeout', function() {
      let completed = false;
      let init = () => completed = true;

      spyOn($state, 'includes').and.returnValue(true);
      spyOn($state, 'go');

      service.synchronizeSection(['a', 'b'], init);
      expect(completed).toBe(false);
      $timeout.flush();
      expect(completed).toBe(true);
    });

    it('cancels prior initialization on second synchronization call', function() {
      let completed = false;
      let init = () => completed = true;

      spyOn($state, 'includes').and.returnValue(true);
      spyOn($state, 'go');

      service.synchronizeSection(['a', 'b'], init);
      service.synchronizeSection(['a', 'b'], angular.noop);
      $timeout.flush();
      expect(completed).toBe(false);
    });

  });

});
