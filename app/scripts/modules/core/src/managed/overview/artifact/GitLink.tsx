import React from 'react';

import { HoverablePopover, Markdown } from 'core/presentation';

import { QueryGitMetadata } from '../types';
import { tooltipShowHideProps } from '../../utils/defaults';

import './GitLink.less';

interface IGitLinkProps {
  gitMetadata: NonNullable<QueryGitMetadata>;
  asLink?: boolean;
}

export const GitLink = ({ gitMetadata: { commit, commitInfo, pullRequest }, asLink = true }: IGitLinkProps) => {
  const link = pullRequest?.link || commitInfo?.link;
  let message = commitInfo?.message || commit;
  message = (commit ? `[${commit}] ` : ``) + message?.split('\n')[0];
  return (
    <div className="GitLink">
      <HoverablePopover
        {...tooltipShowHideProps}
        wrapperClassName="git-link-inner no-underline"
        placement="top"
        Component={() => (
          <div className="git-commit-tooltip">
            {commit && (
              <a href={link} target="_blank" className="">
                Open commit {commit}
              </a>
            )}
            {commitInfo?.message && <Markdown className="sp-margin-m-top" message={commitInfo?.message} />}
          </div>
        )}
      >
        {asLink ? (
          <a href={link || '#'} className="commit-message" target="_blank" rel="noopener noreferrer">
            {message}
          </a>
        ) : (
          <span className="commit-message">{message}</span>
        )}
      </HoverablePopover>
    </div>
  );
};
