import * as React from 'react';

import { IArtifact } from 'core/domain';

import './artifactList.less';
import { Artifact } from 'core/pipeline/status/Artifact';

export interface IArtifactListProps {
  artifacts: IArtifact[];
}

export interface IArtifactListState {}

export class ArtifactList extends React.Component<IArtifactListProps, IArtifactListState> {
  constructor(props: IArtifactListProps) {
    super(props);
  }

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
