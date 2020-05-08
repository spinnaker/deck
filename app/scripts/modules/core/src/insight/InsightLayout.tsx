import React from 'react';
import { UIView } from '@uirouter/react';

import { ReactInjector } from 'core/reactShims';
import { FilterCollapse } from 'core/filterModel/FilterCollapse';
import { Application } from 'core/application';

export interface IInsightLayoutProps {
  app: Application;
}

export const InsightLayout = ({ app }: IInsightLayoutProps) => {
  const [appIsReady, setAppIsReady] = React.useState(false);
  const { filtersExpanded, filtersHidden } = ReactInjector.insightFilterStateModel;
  const filterClass = filtersExpanded ? 'filters-expanded' : 'filters-collapsed';

  React.useEffect(() => {
    app.ready().then(() => setAppIsReady(true));
  });

  if (app.notFound || app.hasError) {
    return null;
  }

  return (
    <div className={`insight ${filterClass}`}>
      {!filtersHidden && <FilterCollapse />}
      {!filtersHidden && <UIView name="nav" className="nav" />}
      <UIView name="master" className="nav-content" data-scroll-id="nav-content" />
      {appIsReady && <UIView name="detail" className="detail-content" />}
    </div>
  );
};
