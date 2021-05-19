import { useApolloClient } from '@apollo/client';
import classnames from 'classnames';
import { sortBy, toNumber } from 'lodash';
import React from 'react';

import { Tooltip, useApplicationContextSafe } from 'core/presentation';

import { FetchVersionDocument, FetchVersionQueryVariables } from '../graphql/graphql-sdk';
import { GitLink } from '../overview/artifact/GitLink';
import { HistoryArtifactVersion, VersionData } from './types';
import { TOOLTIP_DELAY } from '../utils/defaults';
import { VersionAuthor, VersionBuilds, VersionCreatedAt } from '../versionMetadata/MetadataComponents';

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

const statusToText: { [key in VersionStatus]: string } = {
  APPROVED: `Ready to deploy`,
  PENDING: `Pending`,
  CURRENT: `Currently deployed`,
  VETOED: `Marked as bad`,
  PREVIOUS: `Previously deployed`,
  DEPLOYING: `Deploying`,
  SKIPPED: 'Skipped',
};

interface IVersionHeadingProps {
  group: VersionData;
  chevron: JSX.Element;
}

export const VersionHeading = ({ group, chevron }: IVersionHeadingProps) => {
  const gitMetadata = group.gitMetadata;
  const client = useApolloClient();
  const app = useApplicationContextSafe();
  const prefetchData = () => {
    client.query<any, FetchVersionQueryVariables>({
      query: FetchVersionDocument,
      variables: { appName: app.name, versions: Array.from(group.versions) },
    });
  };
  return (
    <div className="version-heading" onMouseOver={prefetchData}>
      <div>
        {gitMetadata ? (
          <GitLink gitMetadata={gitMetadata} asLink={false} />
        ) : (
          <div>Build {Array.from(group.buildNumbers).join(', ')}</div>
        )}
        <div className="VersionMetadata">
          <VersionAuthor author={gitMetadata?.author} />
          <VersionBuilds builds={Array.from(group.buildNumbers).map((buildNumber) => ({ buildNumber }))} />
          <VersionCreatedAt createdAt={group.createdAt} />
        </div>
        {/* Shows a badge for each environment with the status of the artifacts in it */}
        <div className="version-environments">
          {Object.entries(group.environments).map(([env, artifacts]) => {
            const statusSummary = getEnvStatusSummary(artifacts);
            const statusColor = statusToColor[statusSummary];
            return (
              <Tooltip delayShow={TOOLTIP_DELAY} value={statusToText[statusSummary]}>
                <div
                  key={env}
                  className={classnames('chip', { 'chip-outlined': !statusColor })}
                  style={{ backgroundColor: `var(${statusColor})` }}
                >
                  {env}
                </div>
              </Tooltip>
            );
          })}
        </div>
      </div>
      <div>{chevron}</div>
    </div>
  );
};
