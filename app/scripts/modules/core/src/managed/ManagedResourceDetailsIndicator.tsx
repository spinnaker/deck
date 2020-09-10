import React from 'react';
import ReactGA from 'react-ga';
import { Dropdown, MenuItem } from 'react-bootstrap';

import { SETTINGS } from 'core/config/settings';
import { HoverablePopover } from 'core/presentation';
import { HelpField } from 'core/help';
import { Application } from 'core/application';
import { IManagedResourceSummary } from 'core/domain';
import { ReactInjector } from 'core/reactShims';

import { toggleResourcePause } from './toggleResourceManagement';
import { showManagedResourceHistoryModal } from './ManagedResourceHistoryModal';
import managedDeliveryLogo from './icons/md-logo-color.svg';

import './ManagedResourceDetailsIndicator.css';

export interface IManagedResourceDetailsIndicatorProps {
  resourceSummary: IManagedResourceSummary;
  application: Application;
}

const logClick = (label: string, resourceId: string) =>
  ReactGA.event({
    category: 'Managed Resource Menu',
    action: `${label} clicked`,
    label: resourceId,
  });

export const ManagedResourceDetailsIndicator = ({
  resourceSummary,
  application,
}: IManagedResourceDetailsIndicatorProps) => {
  if (!resourceSummary) {
    return null;
  }

  const { id, isPaused } = resourceSummary;

  const helpText = (
    <>
      <p>
        <b>Spinnaker is managing this resource.</b>
      </p>
      <p>
        If a difference from the desired state is detected, Spinnaker will act to correct it.{' '}
        <a
          target="_blank"
          onClick={() => logClick('Learn More', id)}
          href="https://www.spinnaker.io/guides/user/managed-delivery/"
        >
          Learn More
        </a>
      </p>
    </>
  );

  // events are getting trapped by React bootstrap menu
  const allowNavigation = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target && target.hasAttribute('href')) {
      window.location.href = target.getAttribute('href');
    }
  };

  const appPausedHelpContent = `
    <p>Resource management is currently disabled for the entire application.
    <a
      href=${ReactInjector.$state.href('home.applications.application.config', {
        section: 'managed-resources',
      })}
    >
      Resume application management
    </a>
</p>`;

  return (
    <div className="flex-container-h middle ManagedResourceDetailsIndicator">
      <HoverablePopover template={helpText} placement="left">
        <div className="md-logo flex-container-h middle">
          <img src={managedDeliveryLogo} width="36px" />
        </div>
      </HoverablePopover>
      <div className="flex-container-v middle flex-1 sp-margin-l-left">
        <span className="summary-message sp-margin-s-bottom">Managed by Spinnaker</span>
        <Dropdown
          className="resource-actions sp-margin-xs-bottom flex-pull-left"
          id="server-group-managed-resource-dropdown"
          pullRight={true}
        >
          <Dropdown.Toggle className="btn btn-sm btn-default dropdown-toggle">Resource Actions</Dropdown.Toggle>
          <Dropdown.Menu className="dropdown-menu">
            {!application.isManagementPaused && (
              <MenuItem onClick={() => toggleResourcePause(resourceSummary, application)}>
                {isPaused ? 'Resume ' : 'Pause '} Management
              </MenuItem>
            )}
            {application.isManagementPaused && (
              <MenuItem disabled={true} onClick={allowNavigation}>
                Resume Management <HelpField content={appPausedHelpContent} />
              </MenuItem>
            )}
            <li>
              <a
                onClick={() => {
                  showManagedResourceHistoryModal({ resourceSummary });
                  logClick('History', id);
                }}
              >
                History
              </a>
            </li>
            <li>
              <a
                target="_blank"
                onClick={() => logClick('Raw Source', id)}
                href={`${SETTINGS.gateUrl}/managed/resources/${id}`}
              >
                Raw Source
              </a>
            </li>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </div>
  );
};
