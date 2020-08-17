import React, { useState } from 'react';
import classNames from 'classnames';

import { IManagedResourceSummary } from '../domain';
import { Icon } from '../presentation';

import { StatusBubble } from './StatusBubble';

import { EnvironmentBadge } from './EnvironmentBadge';
import { useEnvironmentTypeFromResources } from './useEnvironmentTypeFromResources.hooks';

import './EnvironmentRow.less';

interface IEnvironmentRowProps {
  name: string;
  resources?: IManagedResourceSummary[];
  hasPinnedVersions?: boolean;
  children?: React.ReactNode;
}

export function EnvironmentRow({ name, resources = [], hasPinnedVersions, children }: IEnvironmentRowProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isCritical = useEnvironmentTypeFromResources(resources);

  const envRowClasses = classNames({
    srow: true,
  });

  return (
    <div className="EnvironmentRow">
      <div className={envRowClasses}>
        <span className="clickableArea">
          <div className="titleColumn flex-container-h left middle sp-margin-s-right">
            <EnvironmentBadge name={name} critical={isCritical} />
          </div>
          <div className="flex-container-h flex-grow flex-pull-right">
            {hasPinnedVersions && <StatusBubble iconName="pin" appearance="warning" size="small" />}
          </div>
          <div className="expand" onClick={() => setIsCollapsed(!isCollapsed)}>
            {isCollapsed && <Icon name="accordionExpand" size="extraSmall" />}
            {!isCollapsed && <Icon name="accordionCollapse" size="extraSmall" />}
          </div>
        </span>
        {/* <div className="select">
            <i className={`ico icon-checkbox-unchecked`}/>
          </div> */}
      </div>

      {!isCollapsed && <div style={{ margin: '16px 0 40px 8px' }}>{children}</div>}
    </div>
  );
}
