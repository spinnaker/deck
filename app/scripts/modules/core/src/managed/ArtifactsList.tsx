import classNames from 'classnames';
import React, { useState } from 'react';

import {
  IManagedArtifactSummary,
  IManagedArtifactVersion,
  IStatefulConstraint,
  StatefulConstraintStatus,
} from '../domain/IManagedEntity';
import { Icon } from '../presentation';

import { ISelectedArtifactVersion } from './Environments';
import { Pill } from './Pill';
import { IStatusBubbleStackProps, StatusBubbleStack } from './StatusBubbleStack';

import './ArtifactRow.less';

interface IArtifactsListProps {
  artifacts: IManagedArtifactSummary[];
  versionSelected: (version: ISelectedArtifactVersion) => void;
  selectedVersion: ISelectedArtifactVersion;
}

export function ArtifactsList({ artifacts, selectedVersion, versionSelected }: IArtifactsListProps) {
  return (
    <div>
      {artifacts.map(({ versions, name, reference }) =>
        versions.map(version => (
          <ArtifactRow
            key={`${name}-${version.version}`}
            isSelected={
              selectedVersion && selectedVersion.reference === reference && selectedVersion.version === version.version
            }
            clickHandler={versionSelected}
            version={version}
            reference={reference}
            name={artifacts.length > 1 ? reference : null}
          />
        )),
      )}
    </div>
  );
}

const getVersionIcon = ({ git }: IManagedArtifactVersion) => {
  if (git?.pullRequest?.number) {
    return 'spCIPullRequest';
  } else if (git?.commitInfo) {
    return 'spCIBranch';
  } else {
    return null;
  }
};

const getVersionSecondarySummary = ({ git }: IManagedArtifactVersion) => {
  if (git?.pullRequest?.number) {
    return `PR #${git.pullRequest.number} — ${git?.author}`;
  } else if (git?.branch) {
    return `${git.branch} — ${git?.author}`;
  } else {
    return null;
  }
};

interface IArtifactRowProps {
  isSelected: boolean;
  clickHandler: (artifact: ISelectedArtifactVersion) => void;
  version: IManagedArtifactVersion;
  reference: string;
  name?: string;
}

export const ArtifactRow = ({ isSelected, clickHandler, version: versionInfo, reference, name }: IArtifactRowProps) => {
  const { version, displayName, environments, build, git } = versionInfo;
  const [isHovered, setIsHovered] = useState(false);

  const versionIcon = getVersionIcon(versionInfo);
  const secondarySummary = getVersionSecondarySummary(versionInfo);

  return (
    <div
      className={classNames('ArtifactRow', { selected: isSelected })}
      onClick={() => clickHandler({ reference, version })}
      onMouseOver={() => setIsHovered(true)}
      onMouseOut={() => setIsHovered(false)}
    >
      <div className="row-content flex-container-v left sp-padding-m-top sp-padding-l-bottom sp-padding-s-xaxis">
        {(build?.number || build?.id) && (
          <div className="flex-container-h sp-margin-s-bottom">
            <Pill
              bgColor={isSelected ? '#2c4b5f' : undefined}
              textColor={isSelected ? '#c7def5' : undefined}
              text={`#${build.number || build.id} ${name || ''}`}
            />
          </div>
        )}
        <div className="row-middle-section flex-container-h space-between">
          <div className="version-title">
            <div className="flex-container-h middle text-semibold">
              {versionIcon && (
                <span className="flex-container-h middle center sp-margin-xs-right">
                  <Icon name={versionIcon} size="extraSmall" />
                </span>
              )}{' '}
              <span className="version-name">{git?.commitInfo?.message || displayName}</span>
            </div>
            {secondarySummary && <div className="version-secondary-summary">{secondarySummary}</div>}
          </div>
          <div className="sp-margin-s-left">
            <StatusBubbleStack
              borderColor={isSelected ? '#c7def5' : isHovered ? '#e8eaf2' : 'var(--color-alabaster)'}
              maxBubbles={3}
              statuses={getArtifactStatuses(versionInfo)}
            />
          </div>
        </div>
      </div>
      <div className="environment-stages">
        {environments
          .map(({ name, state }) => (
            <span
              key={name}
              className={classNames('environment-stage', state, 'text-bold flex-container-h center middle')}
              style={{ width: `${environments.length / 100}%` }}
            >
              <span className="environment-stage-name">{name}</span>
            </span>
          ))
          .reverse()}
      </div>
    </div>
  );
};

type ArtifactStatusList = IStatusBubbleStackProps['statuses'];
function getArtifactStatuses({ environments }: IManagedArtifactVersion): ArtifactStatusList {
  const statuses: ArtifactStatusList = [];
  // NOTE: The order in which entries are added to `statuses` is important. The highest priority
  // item must be inserted first.

  const isConstraintPendingManualJudgement = (constraint: IStatefulConstraint) =>
    constraint.type == 'manual-judgement' && constraint.status == StatefulConstraintStatus.PENDING;
  const requiresManualApproval = environments.some(environment =>
    environment.statefulConstraints?.some(isConstraintPendingManualJudgement),
  );
  if (requiresManualApproval) {
    statuses.push({ appearance: 'progress', iconName: 'manualJudgement' });
  }

  const isPinned = environments.some(({ pinned }) => pinned);
  if (isPinned) {
    statuses.push({ appearance: 'warning', iconName: 'pin' });
  }

  return statuses;
}
