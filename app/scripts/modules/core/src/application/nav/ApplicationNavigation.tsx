import React from 'react';
import { useRecoilValue } from 'recoil';
import { useCurrentStateAndParams } from '@uirouter/react';
import { find, isEqual } from 'lodash';

import { AppRefresher } from './AppRefresher';
import { NavSection } from './NavSection';
import { Icon, Tooltip, useIsMobile, usePrevious } from '../../presentation';

import { navigationCategoryRegistry } from './navigationCategory.registry';
import { verticalNavExpandedAtom } from './navAtoms';
import { PagerDutyWriter } from 'core/pagerDuty';
import { Application } from '../application.model';
import { ApplicationDataSource } from '../service/applicationDataSource';

import './verticalNav.less';

export interface IApplicationNavigationProps {
  app: Application;
}

export const ApplicationNavigation = ({ app }: IApplicationNavigationProps) => {
  const prevDataSourceAttr = usePrevious(app.attributes.dataSources);
  useCurrentStateAndParams();
  const isMobile = useIsMobile();

  const isExpanded = useRecoilValue(verticalNavExpandedAtom);

  const getNavigationCategories = (dataSources: ApplicationDataSource[]) => {
    const appSources = dataSources.filter(ds => ds.visible !== false && !ds.disabled && ds.sref);
    const allCategories = navigationCategoryRegistry.getAll();
    const categories = allCategories.map(c => appSources.filter(as => as.category === c.key));
    const uncategorizedSources = appSources.filter(
      as => !as.category || !find(allCategories, c => c.key == as.category),
    );
    categories.push(uncategorizedSources);
    return categories;
  };
  const initialCategories = getNavigationCategories(app.dataSources);
  const [navSections, setNavSections] = React.useState(initialCategories);

  const appRefreshSubscription = app.onRefresh(null, () => {
    if (!isEqual(app.attributes.dataSources, prevDataSourceAttr)) {
      const categories = getNavigationCategories(app.dataSources);
      setNavSections(categories);
    }
  });

  React.useEffect(() => {
    appRefreshSubscription();

    return () => {
      appRefreshSubscription();
    };
  }, []);

  const pageApplicationOwner = () => {
    PagerDutyWriter.pageApplicationOwnerModal(app);
  };

  if (!isExpanded && isMobile) {
    return null;
  }

  return (
    <div className={`vertical-navigation flex-fill layer-high${!isExpanded ? ' vertical-nav-collapsed' : ''}`}>
      <h3 className="heading-2 horizontal middle nav-header sp-margin-m-xaxis sp-margin-l-top">
        <AppRefresher app={app} />
        <span className="application-name text-semibold heading-2 sp-margin-m-left">{app.name}</span>
      </h3>
      {navSections
        .filter(section => section.length)
        .map((section, i) => (
          <NavSection key={`section-${i}`} dataSources={section} app={app} />
        ))}
      <div className="nav-section clickable">
        <div className="page-category flex-container-h middle text-semibold" onClick={pageApplicationOwner}>
          <div className="nav-row-item sp-margin-xs-right">
            {!isExpanded ? (
              <Tooltip value="Page App Owner" placement="right">
                <div>
                  <Icon className="nav-item-icon" name="spMenuPager" size="medium" color="danger" />
                </div>
              </Tooltip>
            ) : (
              <Icon className="nav-item-icon" name="spMenuPager" size="medium" color="danger" />
            )}
          </div>
          <span className="nav-name"> Page App Owner</span>
        </div>
      </div>
    </div>
  );
};
