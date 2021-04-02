import React from 'react';

import { AllowedTimeWindow, IAllowedTimesConstraint } from 'core/domain';

const DAYS_TO_STRING: { [key: number]: string } = {
  1: 'Mon',
  2: 'Tue',
  3: 'Wed',
  4: 'Thu',
  5: 'Fri',
  6: 'Sat',
  7: 'Sun',
};

const timeWindowToString = (window: AllowedTimeWindow, timeZone = 'PST') => {
  // TODO: group by hours on the backend.
  const daysString = window.days.map((day) => DAYS_TO_STRING[day]);
  return `${window.hours.join(', ')} (${timeZone}) on ${daysString.join(', ')}`;
};

const DeploymentWindow = ({ allowedTimes, timezone }: IAllowedTimesConstraint['attributes']) => {
  return (
    <div className="text-regular">
      {allowedTimes.map((window, index) => (
        <div key={index}>{timeWindowToString(window, timezone)}</div>
      ))}
    </div>
  );
};

const getTitle = (constraint: IAllowedTimesConstraint) => {
  switch (constraint.status) {
    case 'FAIL':
      return 'Failed to deploy within the allowed windows';
    case 'OVERRIDE_PASS':
      return 'Deployment window constraint was overridden';
    case 'PASS':
      return 'Deployed during one of the previous open windows';
    case 'PENDING':
      return `Deployment can only occur during the following window${
        constraint.attributes.allowedTimes.length > 1 ? 's' : ''
      }:`;
    default:
      return `Allowed times constraint - ${constraint.status}:`;
  }
};

export const AllowedTimesTitle = ({ constraint }: { constraint: IAllowedTimesConstraint }) => {
  return <>{getTitle(constraint)}</>;
};

export const AllowedTimesDescription = ({ constraint }: { constraint: IAllowedTimesConstraint }) => {
  return <DeploymentWindow windows={constraint.attributes.allowedTimes} />;
};
