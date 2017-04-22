import * as React from 'react';
import { uniq } from 'lodash';
import autoBindMethods from 'class-autobind-decorator';

import { NotificationCategory } from './AlertCategory';
import { NotificationList } from './NotificationList';
import { GroupedNotificationList } from './GroupedNotificationList';
import { INotificationCategory, NotificationCategories } from './notificationCategories';
import { INotification } from './NotificationsPopover';

export interface IProps {
  notifications: INotification[];
  grouped: boolean;
  title: string;
  onEditTag(notification: INotification): void;
  onDeleteTag(notification: INotification): void;
}

export interface ICategoryNotifications {
  category: INotificationCategory;
  notifications: INotification[];
}

export interface IState {
  categorizedAlerts: ICategoryNotifications[];
  selectedCategory: INotificationCategory;
}

/**
 * Shows categorized notifications
 *
 * +------------------------------------------------------+
 * |  Alerts                                              |
 * |------------------+-----------------------------------|
 * | Security         |                                   |
 * +------------------| notification 1                    |
 * | Deprecation      |                                   |
 * +------------------| update your libs, yo              |
 * | Other            |                                   |
 * +------------------| Brought to you by Astrid          |
 * |                  |                                   |
 * |                  |-----------------------------------|
 * |                  |                                   |
 * |                  | notification 2                    |
 * |                  |                                   |
 * |                  |                                   |
 * |                  |                                   |
 * +------------------+-----------------------------------+
 */
@autoBindMethods
export class CategorizedNotifications extends React.Component<IProps, IState> {
  public state: IState;

  constructor(props: IProps) {
    super(props);

    const categorizedAlerts = this.categorizeNotifications(props.notifications);
    this.state = {
      categorizedAlerts,
      selectedCategory: categorizedAlerts[0].category,
    };
  }

  public componentWillReceiveProps(props: IProps): void {
    const categorizedAlerts = this.categorizeNotifications(props.notifications);
    this.setState({ categorizedAlerts });
  }

  /**
   * Given a list of alerts, groups into categories (entityTag namespaces, e.g., 'deprecation')
   */
  private categorizeNotifications(allNotifications: INotification[]): ICategoryNotifications[] {
    const getCategory = (notification: INotification) => notification.entityTag.category || 'default';

    const makeAlertCategory = (name: string): ICategoryNotifications => {
      const category = NotificationCategories.getCategory(name);

      return {
        category,
        notifications: allNotifications.filter((n: INotification) => getCategory(n) === name),
      };
    };

    // unique category names found in the alerts.
    const categories: string[] = uniq(allNotifications.map(getCategory));
    return categories.map(makeAlertCategory).sort((a, b) => b.category.severity - a.category.severity);
  }

  private handleCategorySelected(selectedCategory: INotificationCategory): void {
    this.setState({ selectedCategory });
  }

  public render() {
    const { categorizedAlerts, selectedCategory } = this.state;
    const { onEditTag, onDeleteTag } = this.props;
    if (!categorizedAlerts || !selectedCategory) {
      return null;
    }

    const selectedNotifications: INotification[] = categorizedAlerts.find(tuple => tuple.category === selectedCategory).notifications;

    return (
      <div className="flex-container-h">
        <ul className="list-group notification-categories">
          { categorizedAlerts.map(({ category, notifications }) => (
              <NotificationCategory
                isSelected={category === selectedCategory}
                key={category.id}
                category={category}
                notifications={notifications}
                onCategorySelected={this.handleCategorySelected}
              />
            )
          )}
        </ul>

        { this.props.grouped ?
          <GroupedNotificationList notifications={selectedNotifications} /> :
          <NotificationList notifications={selectedNotifications} onEditTag={onEditTag} onDeleteTag={onDeleteTag} />
        }
      </div>
    );
  }
}
