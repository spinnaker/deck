import React from 'react';

import type { ITaskArtifactVersionProps } from './ArtifactVersionTasks';
import { ArtifactVersionTasks } from './ArtifactVersionTasks';
import { Constraints } from './Constraints';
import { VersionTitle } from './VersionTitle';
import type { QueryArtifactVersion } from '../types';
import { useCreateVersionRollbackActions } from './utils';
import type { VersionMessageData } from '../../versionMetadata/MetadataComponents';
import { getBaseMetadata, VersionMetadata } from '../../versionMetadata/VersionMetadata';

interface ICurrentVersionProps {
  data: QueryArtifactVersion;
  environment: string;
  reference: string;
  numNewerVersions?: number;
  pinned?: VersionMessageData;
}

export const CurrentVersion = ({ data, environment, reference, numNewerVersions, pinned }: ICurrentVersionProps) => {
  const { gitMetadata, constraints, verifications, postDeploy } = data;
  const actions = useCreateVersionRollbackActions({
    environment,
    reference,
    version: data.version,
    buildNumber: data.buildNumber,
    status: data.status,
    commitMessage: gitMetadata?.commitInfo?.message,
    isPinned: Boolean(pinned),
    isCurrent: data.isCurrent,
  });

  const versionProps: ITaskArtifactVersionProps = {
    environment,
    reference,
    version: data.version,
    isCurrent: data.isCurrent,
  };

  return (
    <div className="artifact-current-version">
      <VersionTitle
        gitMetadata={gitMetadata}
        buildNumber={data?.buildNumber}
        version={data.version}
        actions={actions}
      />
      <VersionMetadata
        {...getBaseMetadata(data)}
        createdAt={data.createdAt}
        buildsBehind={numNewerVersions}
        pinned={pinned}
      />
      {constraints && (
        <Constraints constraints={constraints} versionProps={{ environment, reference, version: data.version }} />
      )}
      {verifications && <ArtifactVersionTasks type="Verification" artifact={versionProps} tasks={verifications} />}
      {postDeploy && <ArtifactVersionTasks type="Post deploy" artifact={versionProps} tasks={postDeploy} />}
    </div>
  );
};
