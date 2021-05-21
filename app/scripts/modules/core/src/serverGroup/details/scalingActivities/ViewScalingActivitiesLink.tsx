import * as React from 'react';
import { IServerGroup } from 'core/domain';
import { showModal } from 'core/presentation';
import { ScalingActivitiesModal } from './ScalingActivitiesModal';

export interface IViewScalingActivitiesLinkProps {
  serverGroup: IServerGroup;
}

export const ViewScalingActivitiesLink = ({ serverGroup }: IViewScalingActivitiesLinkProps) => (
  <div className="link" onClick={() => showModal(ScalingActivitiesModal, { serverGroup })}>
    View Scaling Activities
  </div>
);
