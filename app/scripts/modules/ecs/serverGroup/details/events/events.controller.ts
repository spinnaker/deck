import { IController, module } from 'angular';
import { IModalServiceInstance } from 'angular-ui-bootstrap';

import { ServerGroupEventsReader } from './serverGroupEventsReader.service';
import { IServerGroup } from '../../../../core/src/domain/index';

export interface IScalingActivitiesViewState {
  loading: boolean;
  error: boolean;
}

export interface IEventDescription {
  createdAt: number;
  message: string;
  id: string;
  status: string;
}

export class EventsController implements IController {
  public viewState: IScalingActivitiesViewState;
  public events: IEventDescription[] = [];

  public constructor(private $uibModalInstance: IModalServiceInstance, public serverGroup: IServerGroup) {
    'ngInject';
    this.serverGroup = serverGroup;
  }

  public $onInit(): void {
    this.viewState = {
      loading: true,
      error: false,
    };

    ServerGroupEventsReader.getEvents(this.serverGroup).then(
      (rawEvents: IEventDescription[]) => {
        this.viewState.loading = false;
        this.events = rawEvents;
      },
      () => {
        this.viewState.error = true;
      },
    );
  }

  public close(): void {
    this.$uibModalInstance.close();
  }
}

export const EVENTS_CTRL = 'spinnaker.ecs.serverGroup.events.controller';
module(EVENTS_CTRL, []).controller('EventsController', EventsController);
