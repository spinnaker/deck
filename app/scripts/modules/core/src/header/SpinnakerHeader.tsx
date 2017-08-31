import * as React from 'react';
import autoBindMethods from 'class-autobind-decorator';
import { UISref, UISrefActive } from '@uirouter/react';
import { UIRouterContext } from '@uirouter/react-hybrid';

import './SpinnakerHeader.css';

const ngReact_1 = require('core/reactShims/ngReact');

export interface ISpinnakerHeaderState {
  navExpanded: boolean;
}

@UIRouterContext
@autoBindMethods
export class SpinnakerHeader extends React.Component<{}, ISpinnakerHeaderState> {

  constructor() {
    super();
    this.state = {
      navExpanded: true
    };
  }

  public toggleNavItems(): void {
    this.setState({
      navExpanded: !this.state.navExpanded
    })
  }

  public render(): React.ReactElement<SpinnakerHeader> {
    const { UserMenu, GlobalSearch, WhatsNew } = ngReact_1.NgReact;

    return (
      <nav className="container styleguide SpinnakerHeader">
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
            <ul className="nav nav-items flex-1">
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
