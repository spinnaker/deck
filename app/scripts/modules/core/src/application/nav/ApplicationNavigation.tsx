import React from 'react';
import { useCurrentStateAndParams } from '@uirouter/react';
import { find, isEqual } from 'lodash';

import { ApplicationRefresher } from './ApplicationRefresher';
import { ApplicationIcon } from '../ApplicationIcon';
import { NavSection } from './NavSection';
import { Icon, Tooltip, useIsMobile, usePrevious } from '../../presentation';
import { SchedulerFactory } from '../../scheduler';
import { CollapsibleSectionStateCache } from '../../cache';

import { navigationCategoryRegistry } from './navigationCategory.registry';
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

  const cacheRefresh = SchedulerFactory.createScheduler(400);
  const [isOpen, setIsOpen] = React.useState(
    !CollapsibleSectionStateCache.isSet('verticalNav') || CollapsibleSectionStateCache.isExpanded('verticalNav'),
  );

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

  React.useEffect(() => {
    cacheRefresh.subscribe(() => {
      const cacheStatus =
        !CollapsibleSectionStateCache.isSet('verticalNav') || CollapsibleSectionStateCache.isExpanded('verticalNav');
      if (cacheStatus !== isOpen) {
        setIsOpen(cacheStatus);
      }
    });

    return () => {
      cacheRefresh.unsubscribe();
    };
  }, [isOpen]);

  const pageApplicationOwner = () => {
    PagerDutyWriter.pageApplicationOwnerModal(app);
  };

  if (!isOpen && isMobile) {
    return null;
  }

  return (
    <div className={`vertical-navigation layer-high${!isOpen ? ' collapsed' : ''}`}>
      <h3 className="heading-2 horizontal middle nav-header sp-margin-l-xaxis sp-margin-l-top sp-margin-s-bottom">
        <div className="hidden-xs sp-margin-l-right vertical">
          <ApplicationIcon app={app} />
          <ApplicationRefresher app={app} />
        </div>
        <span className="application-name text-semibold heading-2 sp-margin-xs-left self-left">{app.name}</span>
      </h3>
      {navSections
        .filter(section => section.length)
        .map((section, i) => (
          <NavSection key={`section-${i}`} dataSources={section} app={app} isCollapsed={!isOpen}/>
        ))}
      <div className="nav-section clickable">
        <div className="page-category flex-container-h middle text-semibold" onClick={pageApplicationOwner}>
          <div className="nav-item sp-margin-s-right">
            {!isOpen ? (
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
