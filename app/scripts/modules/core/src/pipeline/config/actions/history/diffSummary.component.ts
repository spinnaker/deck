import { module } from 'angular';
import { react2angular } from 'react2angular';

import { DiffSummary } from './DiffSummary';

export const DIFF_SUMMARY_COMPONENT = 'spinnaker.core.pipeline.config.diffSummary.component';
module(DIFF_SUMMARY_COMPONENT, []).component('diffSummary', react2angular(DiffSummary, ['summary']));
