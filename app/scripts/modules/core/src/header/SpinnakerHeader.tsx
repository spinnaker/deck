import { useCurrentStateAndParams, useSrefActive } from '@uirouter/react';
import React from 'react';
import { useRecoilState } from 'recoil';

import { Icon } from '@spinnaker/presentation';
import { verticalNavExpandedAtom } from 'core/application/nav/navAtoms';
import { CollapsibleSectionStateCache } from 'core/cache';
import { HelpMenu } from 'core/help/HelpMenu';
import { overridableComponent } from 'core/overrideRegistry';
import { NgReact } from 'core/reactShims';
import { GlobalSearch } from 'core/search/global/GlobalSearch';

import './SpinnakerHeader.css';

export const SpinnakerHeaderContent = () => {
  const { state: currentState } = useCurrentStateAndParams();
  const isApplicationView =
    currentState.name.includes('project.application.') || currentState.name.includes('applications.application.');

  const [verticalNavExpanded, setVerticalNavExpanded] = useRecoilState(verticalNavExpandedAtom);
  const toggleNav = () => {
    setVerticalNavExpanded(!verticalNavExpanded);
    CollapsibleSectionStateCache.setExpanded('verticalNav', !verticalNavExpanded);
  };

  const isDevicePhoneOrSmaller = () => {
    const bodyStyles = window.getComputedStyle(document.body);
    const isPhone = bodyStyles.getPropertyValue('--is-phone');
    return isPhone.toLowerCase() === 'true';
  };
  const [navExpanded] = React.useState(!isDevicePhoneOrSmaller());

  const { UserMenu } = NgReact;
  const searchSref = useSrefActive('home.infrastructure', null, 'active');
  const projectsSref = useSrefActive('home.projects', null, 'active');
  const appsSref = useSrefActive('home.applications', null, 'active');
  const templatesSref = useSrefActive('home.pipeline-templates', null, 'active');

  return (
    <nav className="container spinnaker-header" role="navigation" aria-label="Main Menu">
      <div className="navbar-header horizontal middle">
        <div
          onClick={toggleNav}
          className={`nav-container navbar-menu-icon horizontal middle center sp-margin-xl-right ${
            isApplicationView ? 'app-view-menu' : ''
          }`}
        >
          {isApplicationView && (
            <Icon name={verticalNavExpanded ? 'menuClose' : 'menu'} size="medium" color="primary" />
          )}
        </div>
        <a className="navbar-brand flex-1" href="#">
          SPINNAKER
        </a>
      </div>
      {navExpanded && (
        <div className="nav-container nav-items">
          <ul className="nav nav-items flex-1 page-nav">
            <li key="navHome">
              <a {...searchSref}>Search</a>
            </li>
            <li key="navProjects">
              <a {...projectsSref}>Projects</a>
            </li>
            <li key="navApplications">
              <a {...appsSref}>Applications</a>
            </li>
            <li key="navPipelineTemplates">
              <a {...templatesSref}>Pipeline Templates</a>
            </li>
            <GlobalSearch />
          </ul>
          <ul className="nav nav-items">
            <UserMenu />
            <HelpMenu />
          </ul>
        </div>
      )}
    </nav>
  );
};

export const SpinnakerHeader = overridableComponent(SpinnakerHeaderContent, 'spinnakerHeader');
