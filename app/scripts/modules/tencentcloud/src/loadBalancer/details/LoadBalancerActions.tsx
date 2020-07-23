import * as React from 'react';
import { Dropdown } from 'react-bootstrap';

import {
  Application,
  ApplicationReader,
  LoadBalancerWriter,
  SETTINGS,
  NgReact,
  ConfirmationModalService,
  HelpField,
} from '@spinnaker/core';

import { ITencentcloudLoadBalancer, ITencentcloudLoadBalancerDeleteCommand } from 'tencentcloud/domain';

import { ILoadBalancerFromStateParams } from './loadBalancerDetails';
import { LoadBalancerTypes } from '../configure/LoadBalancerTypes';
import { useState } from 'react';

export interface ILoadBalancerActionsProps {
  app: Application;
  loadBalancer: ITencentcloudLoadBalancer;
  loadBalancerFromParams: ILoadBalancerFromStateParams;
}

export function LoadBalancerActions(props: ILoadBalancerActionsProps) {
  const { app, loadBalancer } = props;
  const [application, setApplication] = useState(app);
  const { AddEntityTagLinks } = NgReact;

  const loadBalancerAppName = loadBalancer.name.split('-')[0];
  if (loadBalancerAppName !== app.name) {
    ApplicationReader.getApplication(loadBalancerAppName)
      .then(loadBalancerApp => {
        setApplication(loadBalancerApp);
      })
      .catch(() => {
        setApplication(props.app);
      });
  }

  const editLoadBalancer = (): void => {
    const { loadBalancer } = props;
    const LoadBalancerModal = LoadBalancerTypes.find(t => t.type === 'application').component;
    LoadBalancerModal.show({ app: application, loadBalancer });
  };

  const deleteLoadBalancer = (): void => {
    const { app, loadBalancer, loadBalancerFromParams } = props;

    if (loadBalancer.instances && loadBalancer.instances.length) {
      return;
    }

    const taskMonitor = {
      application: app,
      title: 'Deleting ' + loadBalancerFromParams.name,
      onTaskComplete: () => props.app.loadBalancers.refresh(),
    };

    const command: ITencentcloudLoadBalancerDeleteCommand = {
      application: app.name,
      cloudProvider: loadBalancer.cloudProvider,
      loadBalancerName: loadBalancer.name,
      loadBalancerId: loadBalancer.id,
      region: loadBalancer.region,
      account: loadBalancer.account,
      credentials: loadBalancer.account,
    };

    const submitMethod = () => LoadBalancerWriter.deleteLoadBalancer(command, app);

    ConfirmationModalService.confirm({
      header: `Really delete ${loadBalancerFromParams.name} in ${loadBalancerFromParams.region}: ${loadBalancerFromParams.accountId}?`,
      buttonText: `Delete ${loadBalancerFromParams.name}`,
      account: loadBalancerFromParams.accountId,
      taskMonitorConfig: taskMonitor,
      submitMethod,
    });
  };

  const entityTagUpdate = (): void => {
    props.app.loadBalancers.refresh();
  };

  return (
    <div style={{ display: 'inline-block' }}>
      <Dropdown className="dropdown" id="load-balancer-actions-dropdown">
        <Dropdown.Toggle className="btn btn-sm btn-primary dropdown-toggle">
          <span>Load Balancer Actions</span>
        </Dropdown.Toggle>
        <Dropdown.Menu className="dropdown-menu">
          <li className={!application ? 'disabled' : ''}>
            <a className="clickable" onClick={editLoadBalancer}>
              Edit Load Balancer
            </a>
          </li>
          {!(loadBalancer.instances || []).length && (
            <li>
              <a className="clickable" onClick={deleteLoadBalancer}>
                Delete Load Balancer
              </a>
            </li>
          )}
          {(loadBalancer.instances || []).length > 0 && (
            <li className="disabled">
              <a className="clickable" onClick={deleteLoadBalancer}>
                Delete Load Balancer{' '}
                <HelpField content="You must detach all instances before you can delete this load balancer." />
              </a>
            </li>
          )}
          {SETTINGS && SETTINGS.feature.entityTags && (
            <AddEntityTagLinks
              component={loadBalancer}
              application={app}
              entityType="loadBalancer"
              onUpdate={entityTagUpdate}
            />
          )}
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
}
