import { module } from 'angular';

import { TencentNgReact } from './tencent.ngReact';
import { TencentReactInjector } from './tencent.react.injector';

export const TENCENT_REACT_MODULE = 'spinnaker.tencent.react';
module(TENCENT_REACT_MODULE, []).run([
  '$injector',
  function($injector: any) {
    // Make angular services importable and (TODO when relevant) convert angular components to react
    TencentReactInjector.initialize($injector);
    TencentNgReact.initialize($injector);
  },
]);
