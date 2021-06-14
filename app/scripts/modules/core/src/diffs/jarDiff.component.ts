import { module } from 'angular';
import { react2angular } from 'react2angular';

import { withErrorBoundary } from 'core/presentation/SpinErrorBoundary';
import { JarDiff } from './JarDiff';

export const JAR_DIFF_COMPONENT = 'spinnaker.diffs.jar.diff.component';
module(JAR_DIFF_COMPONENT, []).component('jarDiff', react2angular(withErrorBoundary(JarDiff, 'jarDiff'), ['jarDiffs']));
