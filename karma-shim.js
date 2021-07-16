/* eslint-disable @spinnaker/import-sort */
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });

Error.stackTraceLimit = Infinity;

// jquery has to be first or many a test will break
global.$ = global.jQuery = require('jquery');

import './app/scripts/modules/app/src/settings';
import './app/scripts/modules/app/src/app';
import './test/helpers/customMatchers';
import { jasmineMockHttpSupport } from './packages/core/src/api/mock/jasmine';

// angular 1 test harness
import 'angular';
import 'angular-mocks';
beforeEach(angular.mock.module('bcherny/ngimport'));

jasmineMockHttpSupport();

let testContext;

testContext = require.context('./packages/amazon/src', true, /\.spec\.(js|ts|tsx)$/);
testContext.keys().forEach(testContext);

testContext = require.context('./packages/appengine/src', true, /\.spec\.(js|ts|tsx)$/);
testContext.keys().forEach(testContext);

testContext = require.context('./packages/azure/src', true, /\.spec\.(js|ts|tsx)$/);
testContext.keys().forEach(testContext);

testContext = require.context('./packages/cloudfoundry/src', true, /\.spec\.(js|ts|tsx)$/);
testContext.keys().forEach(testContext);

testContext = require.context('./packages/core/src', true, /\.spec\.(js|ts|tsx)$/);
testContext.keys().forEach(testContext);

testContext = require.context('./packages/dcos/src', true, /\.spec\.(js|ts|tsx)$/);
testContext.keys().forEach(testContext);

testContext = require.context('./packages/docker/src', true, /\.spec\.(js|ts|tsx)$/);
testContext.keys().forEach(testContext);

testContext = require.context('./packages/ecs/src', true, /\.spec\.(js|ts|tsx)$/);
testContext.keys().forEach(testContext);

testContext = require.context('./packages/google/src', true, /\.spec\.(js|ts|tsx)$/);
testContext.keys().forEach(testContext);

testContext = require.context('./packages/huaweicloud/src', true, /\.spec\.(js|ts|tsx)$/);
testContext.keys().forEach(testContext);

testContext = require.context('./packages/kubernetes/src', true, /\.spec\.(js|ts|tsx)$/);
testContext.keys().forEach(testContext);

testContext = require.context('./packages/oracle/src', true, /\.spec\.(js|ts|tsx)$/);
testContext.keys().forEach(testContext);

testContext = require.context('./packages/tencentcloud/src', true, /\.spec\.(js|ts|tsx)$/);
testContext.keys().forEach(testContext);

testContext = require.context('./packages/titus/src', true, /\.spec\.(js|ts|tsx)$/);
testContext.keys().forEach(testContext);
