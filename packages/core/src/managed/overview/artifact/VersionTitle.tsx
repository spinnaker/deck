import React from 'react';

import { GitLink } from './GitLink';
import type { VersionAction } from '../../artifactActionsMenu/ArtifactActionsMenu';
import { ArtifactActionsMenu } from '../../artifactActionsMenu/ArtifactActionsMenu';
import type { QueryArtifactVersion } from '../types';

interface IVersionTitleProps {
  gitMetadata?: QueryArtifactVersion['gitMetadata'];
  version: string;
  buildNumber?: string;
  actions?: VersionAction[];
}

export const VersionTitle = ({ gitMetadata, buildNumber, version, actions }: IVersionTitleProps) => {
  return (
    <div className="VersionTitle">
      {gitMetadata ? <GitLink gitMetadata={gitMetadata} /> : <div>Build {buildNumber}</div>}
      {actions && (
        <ArtifactActionsMenu
          id={`${version}-${buildNumber}-rollback-actions`}
          title="Rollback"
          actions={actions}
          className="rollback-actions"
          pullRight
        />
      )}
    </div>
  );
};
