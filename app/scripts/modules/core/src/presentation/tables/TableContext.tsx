import * as React from 'react';

import { ITableLayout, ITableColumn } from './Table';

export interface ITableContext {
  layout: ITableLayout;
  isMobile: boolean;
  expandable: boolean;
  allExpanded: boolean;
  setAllExpanded: (allExpanded: boolean) => any;
  columns: ITableColumn[];
}

export const TableContext = React.createContext<ITableContext>(null);
