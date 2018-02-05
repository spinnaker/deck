import * as React from 'react';
import { BindAll } from 'lodash-decorators';
import { UISref, UISrefActive } from '@uirouter/react';
import { UIRouterContext } from '@uirouter/react-hybrid';

import { NgReact } from 'core/reactShims';
import { GlobalSearch } from 'core/search/global/GlobalSearch';

import './SpinnakerHeader.css';

export interface ISpinnakerHeaderState {
  navExpanded: boolean;
}

@UIRouterContext
@BindAll()
export class SpinnakerHeader extends React.Component<{}, ISpinnakerHeaderState> {

  constructor() {
    super();
    this.state = {
      navExpanded: !this.isDevicePhoneOrSmaller()
    };
  }

  public isDevicePhoneOrSmaller(): Boolean {
    const bodyStyles = window.getComputedStyle(document.body);
    const isPhone = bodyStyles.getPropertyValue('--is-phone');
    return isPhone.toLowerCase() === 'true';
  }

  public toggleNavItems(): void {
    this.setState({
      navExpanded: !this.state.navExpanded
    });
  }

  public render(): React.ReactElement<SpinnakerHeader> {
    const { UserMenu, WhatsNew } = NgReact;

    return (
      <nav
        className="container spinnaker-header"
        role="navigation"
        aria-label="Main Menu"
      >
        <div className="navbar-header horizontal middle">
          <a className="navbar-brand flex-1" href="#">SPINNAKER</a>
          <button type="button" className="navbar-toggle" onClick={this.toggleNavItems}>
            <span className="icon-bar" />
            <span className="icon-bar" />
            <span className="icon-bar" />
          </button>
        </div>
        {this.state.navExpanded &&
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
            </ul>

            <ul className="nav nav-items">
              <UserMenu />
              <GlobalSearch />
              <WhatsNew />
            </ul>
          </div>
        }
      </nav>
    );
  }
}
