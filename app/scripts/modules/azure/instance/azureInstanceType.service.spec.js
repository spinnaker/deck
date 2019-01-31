'use strict';

import { API, InfrastructureCaches } from '@spinnaker/core';

describe('Service: InstanceType', function() {
  beforeEach(function() {
    window.module(require('./azureInstanceType.service').name);
  });

  beforeEach(
    window.inject(function(_azureInstanceTypeService_) {
      this.azureInstanceTypeService = _azureInstanceTypeService_;
    }),
  );

  afterEach(function() {
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  it('should instantiate the controller', function() {
    expect(this.azureInstanceTypeService).toBeDefined();
  });
});
