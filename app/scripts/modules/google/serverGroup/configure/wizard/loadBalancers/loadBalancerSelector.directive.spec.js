'use strict';

let angular = require('angular');
require('./loadBalancerSelector.directive.html');

describe('Directive: GCE Load Balancers Selector', function() {

  beforeEach(
    window.module(
      require('./loadBalancerSelector.directive.js'),
      require('./../../serverGroupConfiguration.service.js'),
      require('exports?"ui.select"!ui-select'),
      require('core/forms/uiSelect.decorator.js'),
      require('core/utils/timeFormatters.js'),
      require('core/utils/moment.js')
    )
  );

  var selector, element, gceServerGroupConfigurationService, expectedTime;

  beforeEach(window.inject(function(_gceServerGroupConfigurationService_, _infrastructureCaches_, _momentService_,
                                    settings) {
    gceServerGroupConfigurationService = _gceServerGroupConfigurationService_;


    var lastRefreshed = '2015-01-01T00:00:00';
    var d = new Date(lastRefreshed);
    var t = d.getTime();
    _infrastructureCaches_.loadBalancers = {
      getStats: function() { return {ageMax: t}; }
    };
    var m = _momentService_.tz(t, settings.defaultTimeZone);
    expectedTime = m.format('YYYY-MM-DD HH:mm:ss z');

    selector = angular.element('<gce-server-group-load-balancer-selector command="command" />');
  }));

  beforeEach(window.inject(function($rootScope, $compile) {
    this.scope = $rootScope.$new();
    this.compile = $compile;

    this.scope.command = {backingData: {filtered: {loadBalancers: []}}};
    element = this.compile(selector)(this.scope);
    this.scope.$apply();
  }));

  it('should render the last refreshed time', function() {
    var refreshedSpan = element.find('span:contains("last refreshed")');
    expect(refreshedSpan.length).toEqual(1);
    expect(refreshedSpan.html()).toEqual('last refreshed ' + expectedTime);
  });

  it('should refresh the load balancer cache', function() {
    spyOn(gceServerGroupConfigurationService, 'refreshLoadBalancers').and.returnValue({then: angular.noop});
    element = this.compile(selector)(this.scope);
    this.scope.$apply();

    var a = element.find('a');
    $(a).click().trigger('click');
    this.scope.$apply();
    expect(gceServerGroupConfigurationService.refreshLoadBalancers).toHaveBeenCalled();
  });
});
