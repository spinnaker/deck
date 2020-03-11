import React from 'react';
import { Pill } from 'core/presentation/layout';

import styles from './ArtifactRow.module.css';
import { IManagedArtifactSummary } from 'core/domain';
import { ISelectedArtifact } from './Environments';

interface IArtifactsListProps {
  artifacts: IManagedArtifactSummary[];
  artifactSelected: (artifact: ISelectedArtifact) => void;
  selectedArtifact: ISelectedArtifact;
}

export function ArtifactsList({ artifacts, artifactSelected, selectedArtifact }: IArtifactsListProps) {
  return (
    <div>
      {artifacts.map(({ versions, name }) =>
        versions.map(({ version, environments }) => (
          <>
            <ArtifactRow
              key={`${name}-${version}`}
              clickHandler={() => {
                artifactSelected(
                  selectedArtifact?.name === name && selectedArtifact?.version === version ? null : { name, version },
                );
              }}
              version={version}
              name={name}
              sha="abc123"
              stages={[
                {
                  level: 'ok',
                },
                {
                  level: 'ok',
                },
                {
                  level: 'ok',
                },
              ]}
              statuses={[
                {
                  icon: 'app-window',
                  level: 'error',
                },
                {
                  icon: 'app-window',
                  level: 'error',
                },
              ]}
            />
            {/* <div key={version}>
              <pre
                onClick={() => {
                  artifactSelected(
                    selectedArtifact?.name === name && selectedArtifact?.version === version ? null : { name, version },
                  );
                }}
              >
                {`[${version}] ${name}\n`}
                {environments.map(env => env.name).join(', ')}
              </pre>
            </div> */}
          </>
        )),
      )}
    </div>
  );
}

export function ArtifactRow({ clickHandler, version, name, sha, stages }) {
  return (
    <div className={styles.ArtifactRow} onClick={clickHandler}>
      <div className={styles.content}>
        <div className={styles.version}>
          <Pill text={version} />
        </div>
        <div className={styles.text}>
          <div className={styles.sha}>{sha}</div>
          <div className={styles.name}>{name}</div>
        </div>
        {/* Holding spot for status bubbles */}
      </div>
      <div className={styles.stages}>
        {stages.map((stag, i) => (
          <span key={i} className={styles.stage} />
        ))}
      </div>
    </div>
  );
}
