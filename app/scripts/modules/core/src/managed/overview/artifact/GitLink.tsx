import React from 'react';

import { HoverablePopover, Markdown } from 'core/index';

import { QueryGitMetadata } from '../types';
import { TOOLTIP_DELAY } from '../../utils/defaults';

export const GitLink = ({
  gitMetadata: { commit, commitInfo, pullRequest },
}: {
  gitMetadata: NonNullable<QueryGitMetadata>;
}) => {
  const link = pullRequest?.link || commitInfo?.link;
  const sha = commit ? `SHA: ${commit}` : undefined;
  const tooltip = [sha, commitInfo?.message].filter(Boolean).join('\n\n');
  return (
    <div className="git-link">
      <HoverablePopover
        delayShow={TOOLTIP_DELAY}
        placement="top"
        Component={() => <Markdown className="git-commit-tooltip" message={tooltip} />}
      >
        <a href={link || '#'} target="_blank" rel="noopener noreferrer">
          {commitInfo?.message || commit}
        </a>
      </HoverablePopover>
    </div>
  );
};
