import { get } from 'lodash';
import * as React from 'react';
import { BindAll } from 'lodash-decorators';
import { capitalize } from 'lodash';

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
    <div className={`${this.getRendererClass()}-${col.key}`} key={col.key}>{get(item, col.key)}</div>
  );

  public HrefCellRenderer = ({ item, col }: {item: T, col: ITableColumnConfigEntry<T>}) => (
    <div key={col.key} className={`${this.getRendererClass()}-${col.key}`} >
      <a href={get(item, 'href')}>{get(item, col.key)}</a>
    </div>
  );

  public AccountCellRenderer = ({ item, col }: {item: T, col: ITableColumnConfigEntry<T>}) => {
    let result: JSX.Element;
    if (get(item, col.key)) {
      const { AccountTag } = NgReact;
      const accounts = get<string>(item, col.key).split(',').sort().map((account: string) => (
        <AccountTag key={account} account={account}/>));
      result = (
        <div className={`${this.getRendererClass()}-account`} key="env">
          {accounts}
        </div>
      );
    } else {
      result = (<div key="unknown" className={`${this.getRendererClass()}-account`}>-</div>);
    }

    return result;
  };

  public ValueOrDefaultCellRenderer = ({ item, col, defaultValue = '' }: { item: T, col: ITableColumnConfigEntry<T>, defaultValue: string }) => (
    <div className={`${this.getRendererClass()}-${col.key}`} key={col.key}>{get(item, col.key) || defaultValue}</div>
  );

  public scrollToTop(): void {
    this.gridElement.scrollTop = 0;
  }

  private refCallback(element: HTMLElement): void {
    if (element) {
      this.gridElement = element;
    }
  }

  private HeaderCell = ({ column }: { column: ITableColumnConfigEntry<any> }) => (
    <div className={`${this.getRendererClass()}-header ${this.getRendererClass()}-${column.key}`}>
      {column.label || capitalize(column.key)}
    </div>
  );

  private HeaderRow = () => {
    const { HeaderCell } = this;
    const columnConfig = this.getColumnConfig();

    return (
      <div className="table-header">
        {columnConfig.map(column => <HeaderCell key={column.key} column={column} /> )}
      </div>
    );
  };

  private DataRow = ({ item }: { item: T }) => {
    const rowClass = `${this.getRendererClass()}-row small`;

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
      <div ref={this.refCallback} className={`table ${this.getRendererClass()}-table`}>
        <HeaderRow/>
        <div className="table-contents flex-fill">
          {sortedItems.map(item => <DataRow key={this.getKey(item)} item={item}/>)}
        </div>
      </div>
    );
  }
}
