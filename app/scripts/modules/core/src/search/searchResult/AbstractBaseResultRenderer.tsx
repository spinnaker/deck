import { get } from 'lodash';
import * as React from 'react';
import { BindAll } from 'lodash-decorators';
import { capitalize, kebabCase } from 'lodash';

import { NgReact } from 'core/reactShims';
import { IResultRenderer } from './searchResultFormatter.registry';

export interface ITableColumnConfigEntry<T> {
  key: string;
  label?: string;
  defaultValue?: string;
  notSortable?: boolean;
  scopeField?: boolean;
  // cellRenderer: (item: T, key?: string, defaultValue?: string) => JSX.Element;
  cellRenderer: React.ComponentType<{ item: T, key?: string, col: ITableColumnConfigEntry<T> }>;
}

const colClass = (key: string) => `col-${kebabCase(key)}`;

@BindAll()
export abstract class AbstractBaseResultRenderer<T> implements IResultRenderer {

  private gridElement: HTMLElement;

  public abstract getRendererClass(): string;

  public abstract getKey(item: T): string;

  public abstract getColumnConfig(): ITableColumnConfigEntry<T>[]

  public sortItems(items: T[]): T[] {
    return items;
  }

  public DefaultCellRender = ({ item, col }: {item: T, col: ITableColumnConfigEntry<T>}) => (
    <div className={colClass(col.key)} key={col.key}>{get(item, col.key)}</div>
  );

  public HrefCellRenderer = ({ item, col }: {item: T, col: ITableColumnConfigEntry<T>}) => (
    <div key={col.key} className={colClass(col.key)} >
      <a href={get(item, 'href')}>{get(item, col.key)}</a>
    </div>
  );

  public AccountCellRenderer = ({ item, col }: {item: T, col: ITableColumnConfigEntry<T>}) => {
    const { AccountTag } = NgReact;
    const value = get<string>(item, col.key);
    if (!value) {
      return <div key="unknown" className={colClass(col.key)}>-</div>;
    }

    const accounts = value.split(',').sort();
    return (
      <div className={colClass(col.key)} key="env">
        {accounts.map((account: string) => <AccountTag key={account} account={account}/>)}
      </div>
    );
  };

  public ValueOrDefaultCellRenderer = ({ item, col, defaultValue = '' }: { item: T, col: ITableColumnConfigEntry<T>, defaultValue: string }) => (
    <div className={`search-${col.key}`} key={col.key}>{get(item, col.key) || defaultValue}</div>
  );

  public scrollToTop(): void {
    this.gridElement.scrollTop = 0;
  }

  private refCallback(element: HTMLElement): void {
    if (element) {
      this.gridElement = element;
    }
  }

  private HeaderCell = ({ col }: { col: ITableColumnConfigEntry<any> }) => (
    <div className={colClass(col.key)}>
      {col.label || capitalize(col.key)}
    </div>
  );

  private HeaderRow = () => {
    const { HeaderCell } = this;
    const columnConfig = this.getColumnConfig();

    return (
      <div className="table-header">
        {columnConfig.map(column => <HeaderCell key={column.key} col={column} /> )}
      </div>
    );
  };

  private DataRow = ({ item }: { item: T }) => {
    const rowClass = `table-row small`;

    return (
      <div key={this.getKey(item)} className={rowClass}>
        {this.getColumnConfig().map(c => (
          <c.cellRenderer key={c.key} col={c} item={item} />
        ))}
      </div>
    );
  };

  public render(items: T[]): JSX.Element {
    const { HeaderRow, DataRow } = this;
    const sortedItems = this.sortItems(items || []);

    return (
      <div ref={this.refCallback} className={`table table-search-results table-search-results-${this.getRendererClass()}`}>
        <HeaderRow/>
        <div className="table-contents flex-fill">
          {sortedItems.map(item => <DataRow key={this.getKey(item)} item={item}/>)}
        </div>
      </div>
    );
  }
}
