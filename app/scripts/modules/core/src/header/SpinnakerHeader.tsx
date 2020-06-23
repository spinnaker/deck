import React from 'react';
import { UISref, UISrefActive } from '@uirouter/react';
import { UIRouterContext } from '@uirouter/react-hybrid';

import { NgReact } from 'core/reactShims';
import { Overridable } from 'core/overrideRegistry';
import { GlobalSearch } from 'core/search/global/GlobalSearch';
import { HelpMenu } from 'core/help/HelpMenu';

import './SpinnakerHeader.css';

@UIRouterContext
@Overridable('spinnakerHeader')
export class SpinnakerHeader extends React.Component<{}, {}> {
  public render(): React.ReactElement<SpinnakerHeader> {
    return <SpinnakerHeaderContent />;
  }
}

/**
 * This needs to be a functional component to use an external module's hook.
 * Currently, @Overrides only works on a class component.
 * This is temproary until we can refactor the override component to work for functional components.
 */

export const SpinnakerHeaderContent = () => {
  const isDevicePhoneOrSmaller = () => {
    const bodyStyles = window.getComputedStyle(document.body);
    const isPhone = bodyStyles.getPropertyValue('--is-phone');
    return isPhone.toLowerCase() === 'true';
  };
  const { UserMenu } = NgReact;

  const [navExpanded, setNavExpanded] = React.useState(!isDevicePhoneOrSmaller());
  const toggleNavItems = () => setNavExpanded(!navExpanded);

  return (
    <nav className="container spinnaker-header" role="navigation" aria-label="Main Menu">
      <div className="navbar-header horizontal middle">
        <a className="navbar-brand flex-1" href="#">
          SPINNAKER
        </a>
        <button type="button" className="navbar-toggle" onClick={toggleNavItems}>
          <span className="icon-bar" />
          <span className="icon-bar" />
          <span className="icon-bar" />
        </button>
      </div>
      {navExpanded && (
        <div className="nav-container nav-items">
          <ul className="nav nav-items flex-1 page-nav">
            <li key="navHome">
              <UISrefActive class="active">
                <UISref to="home.infrastructure">
                  <a>Search</a>
                </UISref>
              </UISrefActive>
            </li>
            <li key="navProjects">
              <UISrefActive class="active">
                <UISref to="home.projects">
                  <a>Projects</a>
                </UISref>
              </UISrefActive>
            </li>
            <li key="navApplications">
              <UISrefActive class="active">
                <UISref to="home.applications">
                  <a>Applications</a>
                </UISref>
              </UISrefActive>
            </li>
            <li key="navPipelineTemplates">
              <UISrefActive class="active">
                <UISref to="home.pipeline-templates">
                  <a>Pipeline Templates</a>
                </UISref>
              </UISrefActive>
            </li>
          </ul>
          <ul className="nav nav-items">
            <UserMenu />
            <GlobalSearch />
            <HelpMenu />
          </ul>
        </div>
      )}
    </nav>
  );
};
