import { forOwn, groupBy, sortBy } from 'lodash';
import * as React from 'react';

import { IServerGroup } from 'core/domain';
import { IModalComponentProps, ModalBody, ModalFooter, ModalHeader, useData } from 'core/presentation';
import { timestamp } from 'core/utils';
import { Spinner } from 'core/widgets';

import { ServerGroupReader } from '../../serverGroupReader.service';

export interface IScalingEvent {
  description: string;
  availabilityZone: string;
}

export interface IScalingEventSummary {
  cause: string;
  events: IScalingEvent[];
  startTime: number;
  statusCode: string;
  isSuccessful: boolean;
}

export interface IRawScalingActivity {
  details: string;
  description: string;
  cause: string;
  statusCode: string;
  startTime: number;
}

export interface IScalingActivitiesModalProps extends IModalComponentProps {
  serverGroup: IServerGroup;
}

export const groupScalingActivities = (activities: IRawScalingActivity[]): IScalingEventSummary[] => {
  const grouped = groupBy(activities, 'cause');
  const results: IScalingEventSummary[] = [];

  forOwn(grouped, (group: IRawScalingActivity[]) => {
    if (group.length) {
      const events: IScalingEvent[] = [];
      group.forEach((entry: any) => {
        let availabilityZone = 'unknown';
        try {
          availabilityZone = JSON.parse(entry.details)['Availability Zone'] || availabilityZone;
        } catch (e) {
          // I don't imagine this would happen but let's not blow up the world if it does.
        }
        events.push({ description: entry.description, availabilityZone });
      });
      results.push({
        cause: group[0].cause,
        events,
        startTime: group[0].startTime,
        statusCode: group[0].statusCode,
        isSuccessful: group[0].statusCode === 'Successful',
      });
    }
  });

  return sortBy(results, 'startTime').reverse();
};

export const ScalingActivitiesModal = ({ dismissModal, serverGroup }: IScalingActivitiesModalProps) => {
  const fetchScalingActivities = () =>
    ServerGroupReader.getScalingActivities(serverGroup).then((a) => groupScalingActivities(a));

  const { result: scalingActivities, status, error } = useData(fetchScalingActivities, [], [serverGroup.name]);
  const loading = status === 'PENDING';

  return (
    <>
      <ModalHeader>{`Scaling Activities for ${serverGroup.name}`}</ModalHeader>
      <ModalBody>
        {loading && (
          <div className="flex-container-v middle center sp-margin-xl">
            <Spinner />
          </div>
        )}
        {!loading && Boolean(error) && (
          <div className="flex-container-v middle center sp-margin-xl">
            <p>{`There was an error loading scaling activities for ${serverGroup.name}. Please try again later.`}</p>
          </div>
        )}
        {!loading && !error && !scalingActivities.length && (
          <div className="flex-container-v middle center sp-margin-xl">
            <p>{`No scaling activities found for ${serverGroup.name}.`}</p>
          </div>
        )}
        {!loading &&
          !error &&
          scalingActivities.length &&
          scalingActivities.map((a, i) => (
            <div key={a.cause} className="flex-container-v middle center sp-margin-xl">
              <p className="clearfix">
                <span className={`label label-${a.isSuccessful ? 'success' : 'danger'} pull-left`}>{a.statusCode}</span>
                <span className="label label-default pull-right">{timestamp(a.startTime)}</span>
              </p>
              <p>{a.cause}</p>
              <p>Summary of activities:</p>
              <ul>
                {sortBy(a.events, 'availabilityZone', 'description').map((e) => (
                  <li key={e.description}>
                    {e.description}
                    {e.availabilityZone && <span>{e.availabilityZone}</span>}
                  </li>
                ))}
              </ul>
              {i !== scalingActivities.length - 1 && <hr />}
            </div>
          ))}
      </ModalBody>
      <ModalFooter
        primaryActions={
          <button className="btn btn-primary" onClick={dismissModal}>
            Close
          </button>
        }
      />
    </>
  );
};
