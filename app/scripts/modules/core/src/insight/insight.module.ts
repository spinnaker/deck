import { IModule, module } from 'angular';

import { INSIGHT_LAYOUT_COMPONENT } from './insightLayout.component';

export const INSIGHT_NGMODULE = module('spinnaker.core.insight', [
  require('@uirouter/angularjs').default,
  INSIGHT_LAYOUT_COMPONENT,
]) as IModule;

import './insight.less';

import './insightFilter.component';

import './insightmenu.directive';

import './insightFilterState.model';
