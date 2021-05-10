import React from 'react';
import { Tab } from 'react-bootstrap';

import { Application } from 'core/application';
import { HorizontalTabs } from 'core/presentation/horizontalTabs/HorizontalTabs';

import { EnvironmentsOverview } from './overview/EnvironmentsOverview';

import './Environments2.less';

export const featureFlag = 'newMD_UI';

// TODO: this is a temporary name until we remove the old view
export const Environments2 = ({ app }: { app: Application }) => {
  return (
    <div className="vertical Environments2">
      <HorizontalTabs>
        <Tab title="Overview">
          <EnvironmentsOverview app={app} />
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
