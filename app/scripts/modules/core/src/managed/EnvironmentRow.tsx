import React, { useState } from 'react';
import classNames from 'classnames';

import { IManagedResourceSummary } from '../domain';
import { Icon } from '../presentation';
import { useEnvironmentTypeFromResources } from './useEnvironmentTypeFromResources.hooks';

import './EnvironmentRow.less';

interface IEnvironmentRowProps {
  name: string;
  resources?: IManagedResourceSummary[];
  children?: React.ReactNode;
}

export function EnvironmentRow({ name, resources = [], children }: IEnvironmentRowProps) {
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
