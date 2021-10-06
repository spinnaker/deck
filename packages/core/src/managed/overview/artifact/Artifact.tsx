import { orderBy } from 'lodash';
import React from 'react';

import { CurrentVersion } from './CurrentVersion';
import { PendingVersions } from './PendingVersion';
import { EnvironmentItem } from '../../environmentBaseElements/EnvironmentItem';
import { useMarkVersionAsBad } from './hooks';
import { HoverablePopover, Markdown, useApplicationContextSafe } from '../../../presentation';
import type { QueryArtifact, QueryArtifactVersion } from '../types';
import { isVersionVetoed } from './utils';
import { ACTION_BUTTON_CLASS_NAME, tooltipShowHideProps } from '../../utils/defaults';
import { toPinnedMetadata } from '../../versionMetadata/MetadataComponents';

import './Artifact.less';

type RequiredKeys<T, K extends keyof T> = Exclude<T, K> & Required<Pick<T, K>>;

const hasCreatedAt = (version?: QueryArtifactVersion): version is RequiredKeys<QueryArtifactVersion, 'createdAt'> => {
  return Boolean(version?.createdAt);
};

const sortVersions = (versions: QueryArtifact['versions']) => {
  return orderBy(versions || [], (version) => (version.createdAt ? new Date(version.createdAt).getTime() : 0), [
    'desc',
  ]);
};

const filterPendingVersions = (versions: QueryArtifact['versions'], currentVersion?: QueryArtifactVersion) => {
  if (!hasCreatedAt(currentVersion)) {
    // Everything is newer than current
    return sortVersions(versions);
  }
  const currentVersionCreatedAt = new Date(currentVersion.createdAt);
  const newerVersions = versions
    ?.filter(hasCreatedAt)
    ?.filter((version) => new Date(version.createdAt) > currentVersionCreatedAt || version.status === 'DEPLOYING');

  return sortVersions(newerVersions);
};

export const PinnedVersion = ({ version }: { version: NonNullable<QueryArtifact['pinnedVersion']> }) => {
  const commitMessage = version.gitMetadata?.commitInfo?.message;
  const build = `#${version.buildNumber}`;
  return (
    <div className="another-version-pinned-warning">
      <i className="fas fa-exclamation-triangle" /> Version{' '}
      {commitMessage ? (
        <HoverablePopover
          {...tooltipShowHideProps}
          placement="top"
          Component={() => <Markdown className="git-commit-tooltip" message={commitMessage} />}
        >
          {build}
        </HoverablePopover>
      ) : (
        build
      )}{' '}
      was pinned and will be deployed shortly
    </div>
  );
};
interface IRollbackActionProps {
  currentVersion: QueryArtifactVersion;
  environment: string;
  reference: string;
  isPinned: boolean;
}

const RollbackAction = ({ currentVersion, environment, reference, isPinned }: IRollbackActionProps) => {
  const appName = useApplicationContextSafe().name;
  const onMarkAsBad = useMarkVersionAsBad({
    application: appName,
    environment,
    reference,
    version: currentVersion.version,
    isVetoed: isVersionVetoed(currentVersion),
    isPinned,
    isCurrent: true,
    selectedVersion: {
      buildNumber: currentVersion.buildNumber,
      commitMessage: currentVersion.gitMetadata?.commitInfo?.message,
      commitSha: currentVersion.gitMetadata?.commit,
    },
  });
  return (
    <button className={ACTION_BUTTON_CLASS_NAME} onClick={onMarkAsBad}>
      Rollback...
    </button>
  );
};

interface IArtifactProps {
  artifact: QueryArtifact;
  isPreview?: boolean;
}

export const Artifact = ({ artifact, isPreview }: IArtifactProps) => {
  const { environment, type, reference, versions, pinnedVersion } = artifact;
  const currentVersion = versions?.find((version) => version.isCurrent === true);
  const newerVersions = filterPendingVersions(versions, currentVersion);
  return (
    <EnvironmentItem
      iconName="artifact"
      iconTooltip={`Artifact - ${type}`}
      className="Artifact"
      title={reference}
      rightElement={
        currentVersion && !isPreview ? (
          <RollbackAction {...{ environment, currentVersion, reference }} isPinned={Boolean(pinnedVersion)} />
        ) : undefined
      }
    >
      <div className="sp-margin-m-top">
        {currentVersion ? (
          <CurrentVersion
            data={currentVersion}
            environment={environment}
            reference={reference}
            numNewerVersions={newerVersions?.length}
            pinned={pinnedVersion?.version === currentVersion.version ? toPinnedMetadata(pinnedVersion) : undefined}
            isPreview={isPreview}
          />
        ) : (
          <div>No version is deployed</div>
        )}
      </div>
      {pinnedVersion && pinnedVersion.buildNumber !== currentVersion?.buildNumber && (
        <PinnedVersion version={pinnedVersion} />
      )}
      <PendingVersions artifact={artifact} pendingVersions={newerVersions} />
    </EnvironmentItem>
  );
};
