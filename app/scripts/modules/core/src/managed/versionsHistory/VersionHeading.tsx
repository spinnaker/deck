import classnames from 'classnames';
import { sortBy, toNumber } from 'lodash';
import React from 'react';
import { GitLink } from '../overview/artifact/GitLink';
import { VersionMetadata } from '../overview/artifact/VersionMetadata';
import { HistoryArtifactVersion, VersionData } from './types';
import './VersionsHistory.less';

type VersionStatus = NonNullable<HistoryArtifactVersion['status']>;

// TODO: could we have vetoed + current in the same env? unlikely
const getEnvStatusSummary = (artifacts: HistoryArtifactVersion[]): VersionStatus => {
  // We sort from the newest to the oldest
  const sortedArtifacts = sortBy(artifacts, (artifact) => -1 * toNumber(artifact.buildNumber || 0));

  let status: HistoryArtifactVersion['status'] = 'SKIPPED';
  for (const artifact of sortedArtifacts) {
    switch (artifact.status) {
      case 'CURRENT':
      case 'VETOED':
        return artifact.status;
      case 'APPROVED':
      case 'PENDING':
        if (status !== 'DEPLOYING') {
          status = artifact.status;
        }
        break;
      case 'PREVIOUS':
        if (status === 'SKIPPED') {
          status = artifact.status;
        }
        break;
      case 'DEPLOYING':
        status = artifact.status;
        break;
    }
  }
  return status;
};

const statusToColor: { [key in VersionStatus]: string } = {
  APPROVED: `--color-status-progress`,
  PENDING: `--color-status-progress`,
  CURRENT: `--color-status-success`,
  VETOED: `--color-status-error`,
  PREVIOUS: `--color-accent-g3`,
  DEPLOYING: `--color-accent`,
  SKIPPED: '',
};

interface IVersionHeadingProps {
  group: VersionData;
  chevron: JSX.Element;
}

export const VersionHeading = ({ group, chevron }: IVersionHeadingProps) => {
  const gitMetadata = group.gitMetadata;
  return (
    <div className="version-heading">
      <div>
        {gitMetadata ? (
          <GitLink gitMetadata={gitMetadata} asLink={false} />
        ) : (
          <div>Build {Array.from(group.buildNumbers).join(', ')}</div>
        )}
        <VersionMetadata createdAt={group.createdAt} author={gitMetadata?.author} />
        {/* Shows a badge for each environment with the status of the artifacts in it */}
        <div className="version-environments">
          {Object.entries(group.environments).map(([env, artifacts]) => {
            const statusColor = statusToColor[getEnvStatusSummary(artifacts)];
            return (
              <div
                key={env}
                className={classnames('chip', { 'chip-outlined': !statusColor })}
                style={{ backgroundColor: `var(${statusColor})` }}
              >
                {env} - {getEnvStatusSummary(artifacts)}
              </div>
            );
          })}
        </div>
      </div>
      <div>{chevron}</div>
    </div>
  );
};
