import { module } from 'angular';
import { TENCENTCLOUD_VPC_VPCTAG_DIRECTIVE } from './vpcTag.directive';

export const VPC_MODULE = 'spinnaker.tencentcloud.vpc';
module(VPC_MODULE, [TENCENTCLOUD_VPC_VPCTAG_DIRECTIVE]);
