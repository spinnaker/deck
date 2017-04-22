import { module } from 'angular';

import { react2angular } from 'react2angular';
import * as React from 'react';
import { IEntityTags, IEntityTag } from 'core/domain';
import { NotificationsPopover } from './NotificationsPopover';
import { Placement } from 'core/presentation/Placement';
import { Application } from 'core/application';
import { noop } from 'core/utils';

interface IProps {
  entity: any;
  application: Application;
  placement?: Placement;
  // a horizontal offset percent string
  offset?: string;

  className?: string;

  pageLocation: string;
  entityType: string;

  onUpdate?(): void;
}

/**
 * A notifications popover for alerts and notices.
 * Shows the notifications for a single entity (not rolled up, and not grouped by message)
 */
export class EntityNotifications extends React.Component<IProps, void> {
  public static defaultProps: Partial<IProps> = {
    placement: 'bottom',
    offset: '50%',
    className: '',
    onUpdate: noop,
  };

  public render() {
    const { entity, application, placement, offset, pageLocation, className, entityType, onUpdate } = this.props;
    const entityTags: IEntityTags = entity.entityTags;

    function alertAnalyticsLabel(): string {
      const { account, region, entityId } = entityTags.entityRef;
      const alertsStr = entityTags.alerts.map((tag: IEntityTag) => tag.name).join(',');
      return [ pageLocation, entityType, account, region, entityId, region, alertsStr ].join(':');
    }

    function noticeAnalyticsLabel(): string {
      const { account, region, entityId } = entityTags.entityRef;
      const noticesStr = entityTags.notices.map((tag: IEntityTag) => tag.name).join(',');
      return [ pageLocation, entityType, account, region, entityId, noticesStr ].join(':');
    }

    const tags = entityTags ? [entityTags] : [];

    return (
      <div className="entity-notifications">

        <NotificationsPopover
          entity={entity}
          tags={tags}
          application={application}
          type="alerts"
          gaLabelFn={alertAnalyticsLabel}
          grouped={false}
          categorized={true}
          className={className}
          placement={placement}
          offset={offset}
          onUpdate={onUpdate}
        />

        <NotificationsPopover
          entity={entity}
          tags={tags}
          application={application}
          type="notices"
          gaLabelFn={noticeAnalyticsLabel}
          grouped={false}
          categorized={false}
          className={className}
          placement={placement}
          offset={offset}
          onUpdate={onUpdate}
        />

      </div>
    );
  }
}


export const ENTITY_NOTIFICATIONS = 'spinnaker.core.entityTag.alerts.entitynotifications';
const ngmodule = module(ENTITY_NOTIFICATIONS, []);

ngmodule.component('entityNotifications', react2angular(EntityNotifications, [
  'entity', 'application', 'placement', 'offset', 'className', 'pageLocation', 'entityType', 'onUpdate'
]));


ngmodule.component('entityNotificationsWrapper', {
  template: `
    <entity-notifications
      entity="$ctrl.entity"
      application="$ctrl.application"
      placement="$ctrl.placement"
      offset="$ctrl.offset"
      class-name="$ctrl.className"
      entity-type="$ctrl.entityType"
      page-location="$ctrl.pageLocation"
      on-update="$ctrl.onUpdate"
    ></entity-notifications>
  `,
  bindings: {
    entity: '<',
    application: '<',
    placement: '@',
    offset: '@',
    className: '@',
    entityType: '@',
    pageLocation: '@',
    onUpdate: '&',
  }
});
