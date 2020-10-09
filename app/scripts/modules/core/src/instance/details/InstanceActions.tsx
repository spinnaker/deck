import React from 'react';
import { Dropdown } from 'react-bootstrap';

export interface Action {
  label: string;
  triggerAction: () => void;
}

type ActionGroup = Action[];

export interface IInstanceActionsProps {
  actionGroups: ActionGroup[];
  title?: string;
}

export const InstanceActions = ({ actionGroups, title }: IInstanceActionsProps) => (
  <div style={{ display: 'inline-block' }}>
    <Dropdown className="dropdown" id="instace-actions-dropdown">
      <Dropdown.Toggle className="btn btn-sm btn-primary dropdown-toggle">
        <span>{title || 'Instance Actions'}</span>
      </Dropdown.Toggle>
      <Dropdown.Menu>
        {(actionGroups || [])
          .filter((group) => group.length)
          .map((group, i) => {
            return (
              <>
                {group.map((action) => (
                  <li id={`instance-action-${action.label}`}>
                    <a onClick={action.triggerAction}>{action.label}</a>
                  </li>
                ))}
                {i !== actionGroups.length - 1 && <li role="presentation" className="divider"></li>}
              </>
            );
          })}
      </Dropdown.Menu>
    </Dropdown>
  </div>
);
