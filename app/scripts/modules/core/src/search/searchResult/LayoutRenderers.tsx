import * as React from 'react';
import { HeaderCell, ISearchResultType, ISearchColumn } from 'core';
import { BindAll } from 'lodash-decorators';

export interface IDefaultSearchResultsRendererProps {
  results: any[];
  type: ISearchResultType;
}

@BindAll()
export class DefaultSearchResultsRenderer extends React.Component<IDefaultSearchResultsRendererProps> {
  private el: HTMLElement;

  // Scroll back to top when search type or results change
  public componentWillReceiveProps() {
    this.el && (this.el.scrollTop = 0);
  }

  private refCallback(el: any) {
    this.el = el;
  }

  public render() {
    const { results, type } = this.props;
    const className = `table table-search-results table-search-results-${type.id}`;

    return (
      <div className={className}>
        <DefaultTableHeader type={type}/>
        <DefaultTableBody type={type} items={results} ref={this.refCallback} />
      </div>
    );
  }
}

export const TableHeader: React.StatelessComponent = ({ children }) => (
  <div className="table-header">
    {children}
  </div>
);

export interface ITableHeaderProps {
  type: ISearchResultType;
}

export class DefaultTableHeader extends React.Component<ITableHeaderProps> {
  public render() {
    const { type } = this.props;
    return (
      <TableHeader>
        {type.columns.map(column => (
          <HeaderCell key={column.key} col={column}/>
        ))}
      </TableHeader>
    );
  }
};

export interface ITableRowProps {
  cols: ISearchColumn[],
  item: any,
}

export const TableRow: React.StatelessComponent = ({ children }) => (
  <div className="table-row small">
    {children}
  </div>
);

export class DefaultTableRow extends React.Component<ITableRowProps> {
  public render() {
    const { cols, item } = this.props;
    return (
      <TableRow>
        {cols.map(col => {
          const Renderer = col.cellRenderer;
          return <Renderer key={col.key} col={col} item={item}/>
        })}
      </TableRow>
    )
  }
}


export interface IDefaultTableBodyProps {
  type: ISearchResultType;
  items: any[];
}

export const TableBody: React.StatelessComponent = ({ children }) => (
  <div className="table-contents flex-fill">
    {children}
  </div>
);


export class DefaultTableBody extends React.Component<IDefaultTableBodyProps> {
  public render() {
    const { items, type } = this.props;
    return (
      <TableBody>
        {items.map(item => (
          <DefaultTableRow key={type.itemKeyFn(item)} item={item} cols={type.columns}/>
        ))}
      </TableBody>
    )
  }
}

