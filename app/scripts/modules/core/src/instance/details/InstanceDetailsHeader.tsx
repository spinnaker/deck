import React from 'react';
import { UISref } from '@uirouter/react';
import { UIRouterContextComponent } from '@uirouter/react-hybrid';
import { Spinner } from 'core/widgets/spinners/Spinner';
import { CopyToClipboard } from 'core/utils/clipboard/CopyToClipboard';

import './InstanceDetailsHeader.less';

export interface IInstanceDetailsHeaderProps {
  instanceId: string;
  loading: boolean;
  standalone: boolean;
}
export const InstanceDetailsHeader = ({ instanceId, loading, standalone }: IInstanceDetailsHeaderProps) => (
  <div className="InstanceDetailsHeader">
    {!standalone && (
      <div className="close-button">
        <UIRouterContextComponent>
          <UISref to="^">
            <a className="btn btn-link">
              <span className="glyphicon glyphicon-remove"></span>
            </a>
          </UISref>
        </UIRouterContextComponent>
      </div>
    )}
    {loading && (
      <div className="horizontal center spinner-container">
        <Spinner size="small" />
      </div>
    )}
    {!loading && (
      <div className="header-text horizontal middle">
        <span className="glyphicon glyphicon-hdd {{instance.healthState}}"></span>
        <h3 className="horizontal middle space-between flex-1">{instanceId}</h3>
        <CopyToClipboard text={instanceId} toolTip="Copy to clipboard" />
      </div>
    )}
  </div>
);
