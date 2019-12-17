import React from 'react';

import { IArtifact } from 'core/domain';
import { Artifact } from 'core/pipeline/status/Artifact';

import './artifactList.less';

export interface IArtifactListProps {
  artifacts: IArtifact[];
}

export class ArtifactList extends React.Component<IArtifactListProps> {
  public render() {
    let { artifacts } = this.props;

    artifacts = artifacts || [];
    if (artifacts.length === 0) {
      return null;
    }

    return (
      <div className="artifact-list">
        <ul>
          {artifacts.map((artifact: IArtifact, i: number) => {
            return (
              <li key={`${i}-${name}`} className="break-word">
                <Artifact artifact={artifact} />
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
}
