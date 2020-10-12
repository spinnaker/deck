import { withErrorBoundary } from 'core/presentation/SpinErrorBoundary';
import { module } from 'angular';
import { react2angular } from 'react2angular';

import { ExecutionDetailsSectionNav } from './ExecutionDetailsSectionNav';

export const EXECUTION_DETAILS_SECTION_NAV = 'spinnaker.core.pipeline.details.executionDetailsSectionNav';
module(EXECUTION_DETAILS_SECTION_NAV, []).component(
  'executionDetailsSectionNav',
  react2angular(withErrorBoundary(ExecutionDetailsSectionNav, 'executionDetailsSectionNav'), ['sections']),
);
