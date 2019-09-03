import * as React from 'react';
import { Observable, Subject } from 'rxjs';
import * as classNames from 'classnames';

import { capitalize, isEmpty, filter, flatten, get } from 'lodash';

import { Application } from 'core/application';
import { INotification, INotificationTypeConfig } from 'core/domain';
import { Registry } from 'core/registry';
import { AppNotificationsService } from './AppNotificationsService';
import { NotificationTransformer } from './notification.transformer';
import { EditNotificationModal } from './modal/EditNotificationModal';

export interface INotificationsListProps {
  application?: Application;
  level: string;
  stageType?: string;
  sendNotifications?: boolean;
  handleSendNotificationsChanged?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  notifications: INotification[];
  updateNotifications: (notifications: INotification[]) => void;
}

export interface INotificationsListState {
  isNotificationsDirty: boolean;
  supportedNotificationTypes: string[];
}

export class NotificationsList extends React.Component<INotificationsListProps, INotificationsListState> {
  private destroy$ = new Subject();

  constructor(props: INotificationsListProps) {
    super(props);
    this.state = {
      isNotificationsDirty: false,
      supportedNotificationTypes: Registry.pipeline
        .getNotificationTypes()
        .map((type: INotificationTypeConfig) => type.key),
    };
  }

  public componentDidMount() {
    if (this.props.level === 'application') {
      this.revertNotificationChanges();
    }
  }

  public componentWillUnmount() {
    this.destroy$.next();
  }

  private addNotification = () => {
    this.editNotification();
  };

  private editNotification = (notification?: INotification, index?: number) => {
    const { level, notifications, stageType, updateNotifications } = this.props;
    EditNotificationModal.show({
      notification: notification || { level, when: [] },
      level: level,
      stageType,
    })
      .then(newNotification => {
        const notificationsCopy = notifications || [];
        if (!notification) {
          updateNotifications(notificationsCopy.concat(newNotification));
        } else {
          const update = [...notificationsCopy];
          update[index] = newNotification;
          updateNotifications(update);
        }
        this.setState({ isNotificationsDirty: true });
      })
      .catch(() => {});
  };

  private removeNotification = (index: number) => {
    const notifications = [...this.props.notifications];
    notifications.splice(index, 1);
    this.props.updateNotifications(notifications);
    this.setState({
      isNotificationsDirty: true,
    });
  };

  private revertNotificationChanges = () => {
    /*
      we currently store application level notifications in front50 as a map indexed by type
      {
           "application": "ayuda",
           "email": [ { ... } ]
      }
      the code below unwraps it into a table friendly format and the saveNotifications code will
      write it back into the right format.

      We will change the format in front50 when we rewrite notifications to use CQL so this transformation
      is no longer needed
   */
    const { application, updateNotifications } = this.props;
    const { supportedNotificationTypes } = this.state;
    Observable.fromPromise(AppNotificationsService.getNotificationsForApplication(application.name))
      .takeUntil(this.destroy$)
      .subscribe(notifications => {
        const results = filter(
          flatten(
            supportedNotificationTypes.map(type => {
              return get(notifications, type) || [];
            }),
          ),
          allow => allow !== undefined && allow.level === 'application',
        );
        updateNotifications(results);
      });
    this.setState({ isNotificationsDirty: false });
  };

  private saveNotifications = () => {
    const { application, notifications } = this.props;
    const toSaveNotifications: any = {
      application: application.name,
    };

    notifications.forEach(n => {
      if (isEmpty(get(toSaveNotifications, n.type))) {
        toSaveNotifications[n.type] = [];
      }
      toSaveNotifications[n.type].push(n);
    });

    Observable.fromPromise(
      AppNotificationsService.saveNotificationsForApplication(application.name, toSaveNotifications),
    )
      .takeUntil(this.destroy$)
      .subscribe(() => {
        this.revertNotificationChanges();
      });
  };

  public render() {
    const { level, handleSendNotificationsChanged, notifications, sendNotifications, stageType } = this.props;
    const { isNotificationsDirty } = this.state;
    return (
      <>
        {level === 'stage' && stageType !== 'manualJudgment' && (
          <div className="form-group">
            <div className="col-md-9 col-md-offset-1">
              <div className="checkbox">
                <label>
                  <input type="checkbox" onChange={handleSendNotificationsChanged} checked={sendNotifications} />
                  <strong>Send notifications for this stage</strong>
                </label>
              </div>
            </div>
          </div>
        )}
        {(level !== 'stage' || sendNotifications) && (
          <div className="row">
            <div className={'col-md-12'}>
              <table className="table table-condensed">
                {notifications && notifications.length > 0 && (
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Details</th>
                      <th>Notify When</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                )}
                <tbody>
                  {notifications &&
                    notifications.map((n, i) => {
                      return (
                        <tr key={i} className={classNames({ 'templated-pipeline-item': n.inherited })}>
                          <td>{capitalize(n.type)}</td>
                          <td>{NotificationTransformer.getNotificationDetails(n)}</td>
                          <td>
                            {n.when &&
                              n.when.map((w, k) => (
                                <div key={k}>
                                  {NotificationTransformer.getNotificationWhenDisplayName(w, level, stageType)}
                                </div>
                              ))}
                          </td>
                          <td>
                            {!n.inherited && (
                              <>
                                <button className="btn btn-xs btn-link" onClick={() => this.editNotification(n, i)}>
                                  Edit
                                </button>
                                <button
                                  className="btn btn-xs btn-link pad-left"
                                  onClick={() => this.removeNotification(i)}
                                >
                                  Remove
                                </button>
                              </>
                            )}
                            {n.inherited && <span className="btn btn-xs pad-left">Inherited from template</span>}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={7}>
                      <button className="btn btn-block add-new" onClick={() => this.addNotification()}>
                        <span className="glyphicon glyphicon-plus-sign" /> Add Notification Preference
                      </button>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
        {level === 'application' && (
          <div className="row main-footer">
            <div className="col-md-3">
              {isNotificationsDirty && (
                <button
                  className="btn btn-default"
                  onClick={() => this.revertNotificationChanges()}
                  style={{ visibility: 'visible' }}
                >
                  <span className="glyphicon glyphicon-flash" /> Revert
                </button>
              )}
            </div>
            <div className="col-md-9 text-right">
              {isNotificationsDirty && (
                <button className="btn btn-primary" onClick={() => this.saveNotifications()}>
                  <span className="far fa-check-circle" /> Save Changes
                </button>
              )}
              {isNotificationsDirty === false && (
                <span className="btn btn-link disabled">
                  <span className="far fa-check-circle" /> In sync with server
                </span>
              )}
            </div>
          </div>
        )}
      </>
    );
  }
}
