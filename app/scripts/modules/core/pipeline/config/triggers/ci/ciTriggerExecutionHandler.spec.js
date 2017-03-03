'use strict';

describe('CI Trigger: ExecutionHandler', function() {

  var $scope, handler;

  beforeEach(
    window.module(
      require('./ciTrigger.module.js')
    )
  );

  beforeEach(window.inject(function($rootScope, ciTriggerExecutionHandler) {
    $scope = $rootScope.$new();
    handler = ciTriggerExecutionHandler;
  }));

  it('returns job and master as label', function () {
    let label = null;
    handler.formatLabel({job: 'a', master: 'b'}).then((result) => label = result);
    $scope.$digest();
    expect(label).toBe('(CI) b: a');
  });

});
