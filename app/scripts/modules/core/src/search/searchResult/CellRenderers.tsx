import * as React from 'react';
import { capitalize, kebabCase } from 'lodash';

import { NgReact } from 'core/reactShims';

export type CellRenderer = React.ComponentType<{ item: any, col: ISearchColumn, defaultValue?: string }>;

export interface ISearchColumn {
  key: string;
  label?: string;
  defaultValue?: string;
  notSortable?: boolean;
  scopeField?: boolean;
  cellRenderer: CellRenderer;
}

const colClass = (key: string) => `col-${kebabCase(key)}`;

export const HeaderCell = ({ col }: { col: ISearchColumn }) => (
  <div className={colClass(col.key)}>
    {col.label || capitalize(col.key)}
  </div>
);

/****** Data Cell Renderers ******/

export interface ICellRendererProps {
  item: any;
  col: ISearchColumn;
  defaultValue?: string;
}

export const BasicCell = ({ item, col, defaultValue = '' }: ICellRendererProps) => (
  <div className={colClass(col.key)}>
    {item[col.key] || defaultValue}
  </div>
);

export const HrefCell = ({ item, col }: ICellRendererProps) => (
  <div className={colClass(col.key)} >
    <a href={item.href}>{item[col.key]}</a>
  </div>
);

export const AccountCell = ({ item, col }: ICellRendererProps) => {
  const { AccountTag } = NgReact;
  const value = item[col.key];
  if (!value) {
    return <div className={colClass(col.key)}>-</div>;
  }

  const accounts = value.split(',').sort();
  return (
    <div className={colClass(col.key)}>
      {accounts.map((account: string) => (
        <AccountTag key={account} account={account}/>
      ))}
    </div>
  );
};
