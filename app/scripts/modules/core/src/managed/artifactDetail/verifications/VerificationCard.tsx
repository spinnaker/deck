import React from 'react';

import { IVerification } from 'core/domain';

import { Button } from '../../Button';
import { DurationRender } from '../../RelativeTimestamp';
import { IStatusCardProps, StatusCard } from '../../StatusCard';

const statusToText: { [key in IVerification['status']]: string } = {
  NOT_EVALUATED: 'Verification has not started yet',
  PENDING: `Verification in progress`,
  PASS: `Verification passed`,
  FAIL: `Verification failed`,
  OVERRIDE_FAIL: `TBD`,
  OVERRIDE_PASS: `TBD`,
};

const FINISHED_STATES: Array<IVerification['status']> = ['PASS', 'FAIL', 'OVERRIDE_FAIL', 'OVERRIDE_PASS'];

const statusToAppearance: { [key in IVerification['status']]?: IStatusCardProps['appearance'] } = {
  PASS: 'success',
  FAIL: 'error',
};

interface VerificationCardProps {
  verification: IVerification;
  logClick: (action: string) => void;
  wasHalted: boolean;
}

export const VerificationCard: React.FC<VerificationCardProps> = ({ verification, logClick, wasHalted }) => {
  const { startedAt, completedAt, link, status } = verification;
  return (
    <StatusCard
      appearance={statusToAppearance[status] ?? 'neutral'}
      iconName="mdVerification"
      title={
        <>
          {wasHalted ? 'Verification was halted' : statusToText[status]}
          {FINISHED_STATES.includes(status) && startedAt && (
            <>
              {' '}
              —{' '}
              <span className="text-regular">
                <DurationRender {...{ startedAt, completedAt }} />
              </span>
            </>
          )}
        </>
      }
      timestamp={startedAt}
      actions={
        link && (
          <div>
            <a
              href={link}
              target="_blank"
              rel="noreferrer"
              className="nostyle"
              onClick={() => {
                logClick('View verification progress');
              }}
            >
              <Button>View logs</Button>
            </a>
          </div>
        )
      }
    />
  );
};
