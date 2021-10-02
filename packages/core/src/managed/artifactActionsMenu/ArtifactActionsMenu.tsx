import classnames from 'classnames';
import React from 'react';
import { Dropdown, MenuItem } from 'react-bootstrap';

import { useLogEvent } from '../utils/logging';

import './ArtifactActionsMenu.less';

export interface VersionAction {
  onClick?: () => void;
  href?: string;
  content: string;
  disabled?: boolean;
}

export interface IVersionMetadataActionsProps {
  id: string;
  actions: VersionAction[];
  title: string;
  className?: string;
  pullRight?: boolean;
}

export const ArtifactActionsMenu = ({ id, title, actions, className, pullRight }: IVersionMetadataActionsProps) => {
  const logEvent = useLogEvent('ArtifactActions');
  return (
    <Dropdown id={id} className={classnames('ArtifactActionsMenu', className)} pullRight={pullRight}>
      <Dropdown.Toggle>{title}</Dropdown.Toggle>
      <Dropdown.Menu>
        {actions.map((action, index) => (
          <MenuItem
            key={index}
            disabled={action.disabled}
            onClick={() => {
              action.onClick?.();
              logEvent({ action: `OpenModal - ${action.content}` });
            }}
            href={action.href}
            target="_blank"
          >
            {action.content}
          </MenuItem>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};
