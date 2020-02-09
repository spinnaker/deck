import React from 'react';

import { HoverablePopover } from 'core/presentation';

export interface BadgePopoverProps {
  container?: JSX.Element | HTMLElement;
  count: number;
  handleBadgeClick?: (e: React.MouseEvent<HTMLElement>) => void;
  handleShowPopover?: () => void;
  icon: React.ReactNode;
  popoverBody: React.ReactNode;
  title: string;
}

export class BadgePopover extends React.Component<BadgePopoverProps> {
  public render(): React.ReactElement<BadgePopover> {
    const { count, icon, handleShowPopover, handleBadgeClick, popoverBody, title } = this.props;

    const popover = (
      <div className="menu-badge-popover">
        <div className="menu-badge-popover-header"> {title} </div>
        {popoverBody}
      </div>
    );

    return (
      <HoverablePopover
        container={this.props.container}
        delayShow={100}
        delayHide={150}
        onShow={handleShowPopover}
        placement="bottom"
        template={popover}
        hOffsetPercent="80%"
        className="no-padding menu-badge-popover"
      >
        <button onClick={handleBadgeClick} className="btn btn-link btn-badge-popover clearfix no-padding">
          <span className="badge badge-counter">
            <span className="icon">{icon}</span> {count}
          </span>
        </button>
      </HoverablePopover>
    );
  }
}
