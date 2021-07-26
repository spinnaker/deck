import * as React from 'react';
import { 
  ICapacity, 
  IModalComponentProps,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ServerGroupReader, 
  Spinner, 
  timestamp, 
  useData 
} from '@spinnaker/core';
import { ITitusServerGroup } from '../../../domain';

export interface ITitusScalingActivitiesProps extends IModalComponentProps {
  serverGroup: ITitusServerGroup;
}

type JobState = 'Accepted' | 'KillInitiated' | 'Finished';

interface ITitusScalingEvent {
  capacity: ICapacity;
  jobId: string;
  jobState: JobState;
  reasonCode: string;
  reasonMessage: string; 
  timeStamp: string;
}

export const TitusScalingActivitiesModal = ({ dismissModal, serverGroup }: ITitusScalingActivitiesProps) => {
  const fetchScalingActivities = () => ServerGroupReader.getScalingActivities(serverGroup);

  const { result: scalingActivities, status, error } = useData(fetchScalingActivities, [], [serverGroup.id]);
  const loading = status === 'PENDING';

  return (
    <>
      <ModalHeader>{`Scaling activities for ${serverGroup.name}`}</ModalHeader>
      <ModalBody>
        <div className="flex-1 heading-3">
          {loading && (
            <div className="horizontal center sp-margin-xl-yaxis">
              <Spinner />
            </div>
          )}
          {!loading && Boolean(error) && (
            <div className="horizontal center sp-margin-xl-yaxis">
              <h4>{`There was an error loading scaling activities for ${serverGroup.name}. Please try again later.`}</h4>
            </div>
          )}
          {!loading && !error && !scalingActivities.length && (
            <div className="horizontal center sp-margin-xl-yaxis">
              <h4>{`No scaling activities found for ${serverGroup.name}.`}</h4>
            </div>
          )}
          {!loading && !error && scalingActivities.length && (
            <div className="middle sp-margin-xl-yaxis">
              {scalingActivities.map((a: ITitusScalingEvent, i) => (
                <div key={`${i}-${a.jobId}`} className="sp-margin-xl-yaxis">
                  <p className="clearfix">
                    <span className={`label label-${a.jobState !== 'KillInitiated' ? 'success' : 'danger'} pull-left`}>
                      {a.jobState}
                    </span>
                    <span className="label label-default pull-right">{timestamp(a.timeStamp)}</span>
                  </p>
                  <p>{`${a.reasonMessage} Desired capacity is ${a.capacity?.desired || 'unknown'}.`}</p>
                </div>
              ))}
            </div>
          )}
        </div>
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
}