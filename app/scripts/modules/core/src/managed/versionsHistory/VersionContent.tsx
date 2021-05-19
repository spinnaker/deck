import React from 'react';
import ContentLoader from 'react-content-loader';

import { useApplicationContextSafe } from 'core/presentation';

import { BaseEnvironment } from '../environmentBaseElements/BaseEnvironment';
import { BaseEnvironmentItem } from '../environmentBaseElements/BaseEnvironmentItem';
import { useFetchVersionQuery } from '../graphql/graphql-sdk';
import { ArtifactVersionTasks } from '../overview/artifact/ArtifactVersionTasks';
import { Constraints } from '../overview/artifact/Constraints';
import { getLifecycleEventDuration, getLifecycleEventLink, useCreateVersionActions } from '../overview/artifact/utils';
import { PinnedVersions, VersionData, VersionInEnvironment } from './types';
import { VersionMetadata } from '../versionMetadata/VersionMetadata';

import './VersionsHistory.less';

interface IVersionInEnvironmentProps {
  environment: string;
  version: VersionInEnvironment;
  envPinnedVersions?: PinnedVersions[keyof PinnedVersions];
}

const useGetDetailedVersionData = ({ environment, version }: Omit<IVersionInEnvironmentProps, 'envPinnedVersions'>) => {
  const app = useApplicationContextSafe();
  const { data: detailedVersionData, error, loading } = useFetchVersionQuery({
    variables: { appName: app.name, versions: [version.version] },
  });
  const environmentData = detailedVersionData?.application?.environments?.find((env) => env.name === environment);
  const artifactData = environmentData?.state.artifacts?.find((artifact) => artifact.reference === version.reference);
  return { detailedVersionData: artifactData?.versions?.find((v) => v.version === version.version), error, loading };
};

const VersionInEnvironment = ({ environment, version, envPinnedVersions }: IVersionInEnvironmentProps) => {
  const { detailedVersionData, loading } = useGetDetailedVersionData({ environment, version });
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
      previous: detailedVersionData?.gitMetadata?.comparisonLinks?.toPreviousVersion,
      current: detailedVersionData?.gitMetadata?.comparisonLinks?.toCurrentVersion,
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
        buildLink={getLifecycleEventLink(detailedVersionData, 'BUILD')}
        author={version.gitMetadata?.author}
        deployedAt={detailedVersionData?.deployedAt}
        buildDuration={getLifecycleEventDuration(detailedVersionData, 'BUILD')}
        actions={actions}
        isPinned={isPinned}
      />
      {loading && (
        <ContentLoader width="100%" height={30}>
          <rect x="0" y="8" rx="5" ry="5" width="60%" height="8" />
          <rect x="0" y="22" rx="5" ry="5" width="50%" height="8" />
        </ContentLoader>
      )}
      <Constraints
        constraints={detailedVersionData?.constraints}
        versionProps={{ environment, reference: version.reference, version: version.version }}
        expandedByDefault={false}
      />
      <ArtifactVersionTasks type="Verification" tasks={detailedVersionData?.verifications} />
      <ArtifactVersionTasks type="Post deploy" tasks={detailedVersionData?.postDeploy} />
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
