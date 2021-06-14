import { module } from 'angular';
import { react2angular } from 'react2angular';

import { withErrorBoundary } from 'core/presentation/SpinErrorBoundary';
import { CommitHistory } from './CommitHistory';

export const COMMIT_HISTORY_COMPONENT = 'spinnaker.diffs.commit.history.component';
module(COMMIT_HISTORY_COMPONENT, []).component(
  'commitHistory',
  react2angular(withErrorBoundary(CommitHistory, 'commitHistory'), ['commits']),
);
