import { mock } from 'angular';

import { EXECUTION_FILTER_SERVICE, ExecutionFilterService } from './executionFilter.service';
import { ExecutionFilterModel } from 'core/pipeline/filter/ExecutionFilterModel';
import { ExecutionState } from 'core/state';

describe('Service: executionFilterService', function() {
  let service: ExecutionFilterService;
  let model: ExecutionFilterModel;

  beforeEach(function() {
    mock.module(EXECUTION_FILTER_SERVICE);
    mock.inject(function(executionFilterService: ExecutionFilterService) {
      service = executionFilterService;
      model = ExecutionState.filterModel;
      model.asFilterModel.groups = [];
      spyOn(model.asFilterModel, 'applyParamsToUrl').and.callFake(() => {});
    });
  });

  describe('Sorting', () => {
    it('sorts pipeline groups by index, always putting strategies at the end, followed by ad-hoc pipelines', () => {
      const firstGroup = { config: { index: 1 } };
      const secondGroup = { config: { index: 2 } };
      const strategy = { config: { index: 0, strategy: true } };
      const adHocA = { heading: 'a' };
      const adHocB = { heading: 'b' };
      const groups = [strategy, adHocB, adHocA, secondGroup, firstGroup];
      const sorted = groups.sort((a: any, b: any) => service.executionGroupSorter(a, b));

      expect(sorted).toEqual([firstGroup, secondGroup, strategy, adHocA, adHocB]);
    });
  });
});
