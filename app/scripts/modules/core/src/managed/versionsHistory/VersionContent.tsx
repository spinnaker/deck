import React from 'react';
import ContentLoader from 'react-content-loader';

import { useApplicationContextSafe } from 'core/presentation';

import { BaseEnvironment } from '../environmentBaseElements/BaseEnvironment';
import { EnvironmentItem } from '../environmentBaseElements/EnvironmentItem';
import { EnvironmentsRender, useOrderedEnvironment } from '../environmentBaseElements/EnvironmentsRender';
import { useFetchVersionQuery } from '../graphql/graphql-sdk';
import { ArtifactVersionTasks } from '../overview/artifact/ArtifactVersionTasks';
import { Constraints } from '../overview/artifact/Constraints';
import { useCreateVersionActions } from '../overview/artifact/utils';
import { HistoryArtifactVersionExtended, PinnedVersions, VersionData } from './types';
import { toPinnedMetadata, VersionMessageData } from '../versionMetadata/MetadataComponents';
import { getBaseMetadata, VersionMetadata } from '../versionMetadata/VersionMetadata';

import './VersionsHistory.less';

interface IVersionInEnvironmentProps {
  environment: string;
  version: HistoryArtifactVersionExtended;
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

const LoadingAnimation = () => (
  <ContentLoader width="100%" height={30}>
    <rect x="0" y="8" rx="5" ry="5" width="60%" height="8" />
    <rect x="0" y="22" rx="5" ry="5" width="50%" height="8" />
  </ContentLoader>
);

const VersionInEnvironment = ({ environment, version, envPinnedVersions }: IVersionInEnvironmentProps) => {
  const { detailedVersionData, loading } = useGetDetailedVersionData({ environment, version });
  let pinnedData: VersionMessageData | undefined;
  const currentPinnedVersion = envPinnedVersions?.[version.reference];
  if (currentPinnedVersion && currentPinnedVersion.buildNumber === version.buildNumber) {
    pinnedData = toPinnedMetadata(currentPinnedVersion);
  }

  const actions = useCreateVersionActions({
    environment,
    reference: version.reference,
    version: version.version,
    buildNumber: version.buildNumber,
    status: version.status,
    commitMessage: version.gitMetadata?.commitInfo?.message,
    isPinned: Boolean(pinnedData),
    compareLinks: {
      previous: detailedVersionData?.gitMetadata?.comparisonLinks?.toPreviousVersion,
      current: detailedVersionData?.gitMetadata?.comparisonLinks?.toCurrentVersion,
    },
  });

  return (
    <EnvironmentItem
      title={version.reference}
      iconName="artifact"
      iconTooltip={`Artifact - ${version.type}`}
      size="small"
    >
      <VersionMetadata
        key={version.id}
        author={version.gitMetadata?.author}
        version={version.version}
        {...(detailedVersionData ? getBaseMetadata(detailedVersionData) : undefined)}
        actions={actions}
        pinned={pinnedData}
      />

      {loading && <LoadingAnimation />}
      <Constraints
        constraints={detailedVersionData?.constraints}
        versionProps={{ environment, reference: version.reference, version: version.version }}
        expandedByDefault={false}
      />
      <ArtifactVersionTasks type="Verification" tasks={detailedVersionData?.verifications} />
      <ArtifactVersionTasks type="Post deploy" tasks={detailedVersionData?.postDeploy} />
    </EnvironmentItem>
  );
};

interface IVersionContentProps {
  versionData: VersionData;
  pinnedVersions?: PinnedVersions;
}

export const VersionContent = ({ versionData, pinnedVersions }: IVersionContentProps) => {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const { environments, ...renderProps } = useOrderedEnvironment(ref, Object.entries(versionData.environments));
  return (
    <EnvironmentsRender {...renderProps} ref={ref}>
      {environments.map(([env, { versions }]) => {
        return (
          <BaseEnvironment key={env} title={env} size="small">
            {versions.map((version) => (
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
    </EnvironmentsRender>
  );
};
