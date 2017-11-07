import { get } from 'lodash';
import * as React from 'react';
import { BindAll } from 'lodash-decorators';
import { capitalize, kebabCase } from 'lodash';

import { NgReact } from 'core/reactShims';
import { IResultRenderer } from './searchResultFormatter.registry';

export interface ITableColumn<T> {
  key: string;
  label?: string;
  defaultValue?: string;
  notSortable?: boolean;
  scopeField?: boolean;
  cellRenderer: React.ComponentType<{ item: T, col: ITableColumn<T>, defaultValue?: string }>;
}

const colClass = (key: string) => `col-${kebabCase(key)}`;

export interface ICellRenderer<T> {item: T, col: ITableColumn<T>}
export interface IDefaultValueCellRenderer<T> extends ICellRenderer<T> {defaultValue?: string}

export const DefaultCellRenderer = <T extends {}>({ item, col }: ICellRenderer<T>) => (
  <div className={colClass(col.key)}>
    {get(item, col.key)}
  </div>
);

export const HrefCellRenderer = <T extends {}>({ item, col }: ICellRenderer<T>) => (
  <div className={colClass(col.key)} >
    <a href={get(item, 'href')}>{get(item, col.key)}</a>
  </div>
);

export const AccountCellRenderer = <T extends {}>({ item, col }: ICellRenderer<T>) => {
  const { AccountTag } = NgReact;
  const value = get<string>(item, col.key);
  if (!value) {
    return <div className={colClass(col.key)}>-</div>;
  }

  const accounts = value.split(',').sort();
  return (
    <div className={colClass(col.key)}>
      {accounts.map((account: string) => <AccountTag key={account} account={account}/>)}
    </div>
  );
};

export const ValueOrDefaultCellRenderer = <T extends {}>({ item, col, defaultValue = '' }: IDefaultValueCellRenderer<T>) => (
  <div className={colClass(col.key)}>
    {get(item, col.key) || defaultValue}
  </div>
);

export const HeaderCell = <T extends {}>({ col }: { col: ITableColumn<T> }) => (
  <div className={colClass(col.key)}>
    {col.label || capitalize(col.key)}
  </div>
);

export const TableHeader = <T extends {}>({ cols }: { cols: ITableColumn<T>[] }) => {
  return (
    <div className="table-header">
      {cols.map(column => (
        <HeaderCell key={column.key} col={column} />
      ))}
    </div>
  );
};

export interface ITableContentsProps<T> {
  items: T[];
  cols: ITableColumn<T>[];
  keyFn: (item: T) => string;
}

export const TableContents = <T extends {}>({ items, cols, keyFn }: ITableContentsProps<T>) => {
  return (
    <div className="table-contents flex-fill">
      {items.map(item => (
        <DataRow key={keyFn(item)} item={item} cols={cols}/>
      ))}
    </div>
  )
};

export interface IDataRowProps<T> {
  cols: ITableColumn<T>[],
  item: T,
}

export const DataRow = <T extends {}>({ cols, item }: IDataRowProps<T>) => (
  <div className={`table-row small`}>
    {cols.map(col => {
      const CellRenderer = col.cellRenderer;
      return <CellRenderer key={col.key} col={col} item={item} />
    })}
  </div>
);


@BindAll()
export abstract class AbstractBaseResultRenderer<T> implements IResultRenderer {

  private gridElement: HTMLElement;

  public abstract getRendererClass(): string;

  public abstract getKey(item: T): string;

  public abstract getColumnConfig(): ITableColumn<T>[]

  public sortItems(items: T[]): T[] {
    return items;
  }

  public scrollToTop(): void {
    this.gridElement.scrollTop = 0;
  }

  protected refCallback(element: HTMLElement): void {
    if (element) {
      this.gridElement = element;
    }
  }

  public render(items: T[]): JSX.Element {
    const columns = this.getColumnConfig();
    const sortedItems = this.sortItems(items || []);
    const className = `table table-search-results table-search-results-${this.getRendererClass()}`;

    return (
      <div ref={this.refCallback} className={className}>
        <TableHeader cols={columns} />
        <TableContents cols={columns} items={sortedItems} keyFn={this.getKey} />
      </div>
    );
  }
}
