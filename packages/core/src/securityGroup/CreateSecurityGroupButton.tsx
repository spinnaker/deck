import * as React from 'react';

import { FirewallLabels } from './label/FirewallLabels';
import { Tooltip } from '../presentation';

export const CreateSecurityGroupButton = () => {
  return (
    <div>
      <button className="btn btn-sm btn-default" disabled={true}>
        <span className="glyphicon glyphicon-plus-sign visible-lg-inline" />
        <Tooltip value="Create Load Balancer">
          <span className="glyphicon glyphicon-plus-sign visible-md-inline visible-sm-inline" />
        </Tooltip>
        <span className="visible-lg-inline"> Create {FirewallLabels.get('Firewall')}</span>
      </button>
    </div>
  );
};
