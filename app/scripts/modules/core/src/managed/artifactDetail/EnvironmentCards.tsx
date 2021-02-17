import React from 'react';
import { useRouter } from '@uirouter/react';

import { IManagedArtifactVersionEnvironment } from 'core/domain';

import { Button } from '../Button';
import { StatusCard } from '../StatusCard';
import { logCategories, useLogEvent } from '../utils/logging';
import { IArtifactDetailProps } from './ArtifactDetail';
import { ConstraintCard } from './constraints/ConstraintCard';
import { isConstraintSupported } from './constraints/constraintRegistry';
import { PinnedCard } from './PinnedCard';
import { VerificationCard } from './verifications/VerificationCard';
import { VersionStateCard } from './VersionStateCard';

interface IEnvironmentCardsProps
  extends Pick<
    IArtifactDetailProps,
    'application' | 'reference' | 'version' | 'allVersions' | 'resourcesByEnvironment'
  > {
  environment: IManagedArtifactVersionEnvironment;
  pinnedVersion: string;
}

export const EnvironmentCards: React.FC<IEnvironmentCardsProps> = ({
  application,
  environment,
  reference,
  version: versionDetails,
  allVersions,
  pinnedVersion,
  resourcesByEnvironment,
}) => {
  const {
    name: environmentName,
    state,
    deployedAt,
    replacedAt,
    replacedBy,
    pinned,
    vetoed,
    statefulConstraints,
    statelessConstraints,
    compareLink,
  } = environment;
  const {
    stateService: { go },
  } = useRouter();

  const logEvent = useLogEvent(logCategories.artifactDetails);

  const differentVersionPinnedCard = pinnedVersion &&
    pinnedVersion !== versionDetails.version &&
    !['vetoed', 'skipped'].includes(state) && (
      <StatusCard
        iconName="cloudWaiting"
        appearance="warning"
        background={true}
        title="A different version is pinned here"
        actions={<Button onClick={() => go('.', { version: pinnedVersion })}>See version</Button>}
      />
    );

  const pinnedCard = pinned && (
    <PinnedCard
      resourcesByEnvironment={resourcesByEnvironment}
      environmentName={environmentName}
      pinned={environment.pinned}
      reference={reference}
      version={versionDetails}
    />
  );

  return (
    <>
      {differentVersionPinnedCard}
      {pinnedCard}
      <VersionStateCard
        key="versionStateCard"
        state={state}
        deployedAt={deployedAt}
        replacedAt={replacedAt}
        replacedBy={replacedBy}
        vetoed={vetoed}
        compareLink={compareLink}
        allVersions={allVersions}
        logClick={(action) => logEvent({ action, label: `${environmentName}:${reference}` })}
      />
      {environment.verifications?.map((verification) => (
        <VerificationCard
          key={verification.id}
          verification={verification}
          wasHalted={environment.state === 'skipped'}
          logClick={(action) => logEvent({ action, label: `${environmentName}:${reference}` })}
        />
      ))}
      {[...(statelessConstraints || []), ...(statefulConstraints || [])]
        .filter(({ type }) => isConstraintSupported(type))
        .map((constraint) => (
          <ConstraintCard
            key={constraint.type}
            application={application}
            environment={environment}
            reference={reference}
            version={versionDetails.version}
            constraint={constraint}
          />
        ))}
    </>
  );
};
