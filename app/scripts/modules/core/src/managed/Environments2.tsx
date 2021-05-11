import React from 'react';

import { Application } from 'core/application';
import { HorizontalTabs, Tab } from 'core/presentation/horizontalTabs/HorizontalTabs';

import { Configuration } from './config/Configuration';
import { ManagementWarning } from './config/ManagementWarning';
import { EnvironmentsOverview } from './overview/EnvironmentsOverview';

import './Environments2.less';
import './overview/baseStyles.less';

export const featureFlag = 'newMD_UI';

// TODO: this is a temporary name until we remove the old view
export const Environments2 = ({ app }: { app: Application }) => {
  return (
    <div className="vertical Environments2">
      <HorizontalTabs>
        <Tab title="Overview">
          <ManagementWarning appName={app.name} />
          <EnvironmentsOverview app={app} />
        </Tab>
        <Tab title="Configuration">
          <Configuration appName={app.name} />
        </Tab>
      </HorizontalTabs>
      {/* Some padding at the bottom */}
      <div style={{ minHeight: 32, minWidth: 32 }} />
      <a
        href="#"
        onClick={() => {
          localStorage.removeItem(featureFlag);
          window.location.reload();
        }}
        style={{ position: 'absolute', bottom: 4, right: 36 }}
      >
        Switch to old view
      </a>
    </div>
  );
};
