import 'jquery'; // ensures jQuery is loaded before Angular so Angular does not use jqlite
import { module } from 'angular';
import './strictDi';

import { CORE_MODULE } from '@spinnaker/core';
import { DOCKER_MODULE } from '@spinnaker/docker';
import { AMAZON_MODULE } from '@spinnaker/amazon';
import { APPENGINE_MODULE } from '@spinnaker/appengine';
import { GOOGLE_MODULE } from '@spinnaker/google';
import { CANARY_MODULE } from './modules/canary/canary.module';
import { KUBERNETES_MODULE } from '@spinnaker/kubernetes';
import { ORACLE_MODULE } from '@spinnaker/oracle';
import { KAYENTA_MODULE } from '@spinnaker/kayenta';
import { TITUS_MODULE } from '@spinnaker/titus';
import { ECS_MODULE } from '@spinnaker/ecs';
import '@spinnaker/cloudfoundry';
import { AZURE_MODULE } from '@spinnaker/azure';
import { HUAWEICLOUD_MODULE } from '@spinnaker/huaweicloud';
import { TENCENTCLOUD_MODULE } from '@spinnaker/tencentcloud';
// import { DCOS_DCOS_MODULE } from './modules/dcos/dcos.module';

module('netflix.spinnaker', [
  CORE_MODULE,
  AMAZON_MODULE,
  GOOGLE_MODULE,
  ECS_MODULE,
  AZURE_MODULE,
  DOCKER_MODULE,
  ORACLE_MODULE,
  // DCOS_DCOS_MODULE,
  APPENGINE_MODULE,
  CANARY_MODULE,
  KUBERNETES_MODULE,
  KAYENTA_MODULE,
  TITUS_MODULE,
  HUAWEICLOUD_MODULE,
  TENCENTCLOUD_MODULE,
]);
