import React, { useState } from 'react';
import classNames from 'classnames';

import { IManagedResourceSummary } from '../domain';
import { Icon } from '../presentation';

import { StatusBubble } from './StatusBubble';

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
  const isProd = useEnvironmentTypeFromResources(resources);

  const envRowClasses = classNames({
    srow: true,
    rowProd: isProd,
  });

  const envLabelClasses = classNames({
    envLabel: true,
    prod: isProd,
    nonprod: !isProd,
  });

  return (
    <div className="EnvironmentRow">
      <div className={envRowClasses}>
        <span className="clickableArea">
          <span className={envLabelClasses}>{name}</span>
          <div className="environment-row-status flex-container-h flex-grow flex-pull-right">
            {hasPinnedVersions && <StatusBubble iconName="pin" appearance="warning" size="small" />}
          </div>
        </span>
        <div className="expand" onClick={() => setIsCollapsed(!isCollapsed)}>
          {isCollapsed && <Icon name="accordionExpand" size="extraSmall" />}
          {!isCollapsed && <Icon name="accordionCollapse" size="extraSmall" />}
        </div>
        {/* <div className="select">
            <i className={`ico icon-checkbox-unchecked`}/>
          </div> */}
      </div>

      {!isCollapsed && <div style={{ margin: '16px 0 40px 8px' }}>{children}</div>}
    </div>
  );
}
