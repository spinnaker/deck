import React from 'react';

import { BaseEnvironment } from '../environmentBaseElements/BaseEnvironment';
import { BaseEnvironmentItem } from '../environmentBaseElements/BaseEnvironmentItem';
import { VersionMetadata } from '../overview/artifact/VersionMetadata';
import { getLifecycleEventDuration, getLifecycleEventLink, useCreateVersionActions } from '../overview/artifact/utils';
import { PinnedVersions, VersionData, VersionInEnvironment } from './types';

import './VersionsHistory.less';

interface IVersionInEnvironmentProps {
  environment: string;
  version: VersionInEnvironment;
  envPinnedVersions?: PinnedVersions[keyof PinnedVersions];
}

const VersionInEnvironment = ({ environment, version, envPinnedVersions }: IVersionInEnvironmentProps) => {
  const isPinned = Boolean(
    version.buildNumber !== undefined && envPinnedVersions?.[version.reference]?.buildNumber === version.buildNumber,
  );
  const actions = useCreateVersionActions({
    environment,
    reference: version.reference,
    version: version.version,
    buildNumber: version.buildNumber,
    commitMessage: version.gitMetadata?.commitInfo?.message,
    isPinned,
    compareLinks: {
      previous: version.gitMetadata?.comparisonLinks?.toPreviousVersion,
      current: version.gitMetadata?.comparisonLinks?.toCurrentVersion,
    },
  });
  return (
    <BaseEnvironmentItem
      title={version.reference}
      iconName="artifact"
      iconTooltip={`Artifact - ${version.type}`}
      size="small"
    >
      <VersionMetadata
        key={version.id}
        buildNumber={version.buildNumber}
        buildLink={getLifecycleEventLink(version, 'BUILD')}
        author={version.gitMetadata?.author}
        deployedAt={version.deployedAt}
        buildDuration={getLifecycleEventDuration(version, 'BUILD')}
        actions={actions}
        isPinned={isPinned}
      />
    </BaseEnvironmentItem>
  );
};

interface IVersionContentProps {
  versionData: VersionData;
  pinnedVersions?: PinnedVersions;
}

export const VersionContent = ({ versionData, pinnedVersions }: IVersionContentProps) => {
  return (
    <React.Fragment>
      {Object.entries(versionData.environments).map(([env, artifactVersions]) => {
        return (
          <BaseEnvironment key={env} title={env} size="small">
            {artifactVersions.map((version) => (
              <VersionInEnvironment
                environment={env}
                key={version.id}
                version={version}
                envPinnedVersions={pinnedVersions?.[env]}
              />
            ))}
          </BaseEnvironment>
        );
      })}
    </React.Fragment>
  );
};
