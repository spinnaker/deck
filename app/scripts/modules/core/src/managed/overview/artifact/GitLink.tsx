import React from 'react';

import { HoverablePopover, Markdown } from 'core/index';

import { QueryGitMetadata } from '../types';

export const GitLink = ({
  gitMetadata: { commit, commitInfo, pullRequest },
}: {
  gitMetadata: NonNullable<QueryGitMetadata>;
}) => {
  const link = pullRequest?.link || commitInfo?.link;
  const sha = commitInfo ? `SHA: ${commitInfo.sha}` : ``;
  const tooltip = commitInfo?.message ? `${commitInfo?.message}\n\n${sha}` : sha;
  return (
    <div className="git-link">
      <HoverablePopover
        delayHide={100}
        placement="top"
        Component={() => <Markdown className="git-commit-tooltip" message={tooltip} />}
      >
        <div className="git-commit-message-sha">
          <a href={link || '#'} target="_blank" rel="noopener noreferrer">
            {commit}
            {commitInfo?.message && `:`} {commitInfo?.message}
          </a>
        </div>
      </HoverablePopover>
    </div>
  );
};
