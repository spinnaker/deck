import * as React from 'react';
import { HeaderCellRenderer, ISearchResultType, ISearchColumn } from 'core';
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

export interface ITableHeaderProps {
  type: ISearchResultType;
}

export class DefaultTableHeader extends React.Component<ITableHeaderProps> {
  render() {
    const { type } = this.props;

    return (
      <div className="table-header">
        {type.columns.map(column => (
          <HeaderCellRenderer key={column.key} col={column}/>
        ))}
      </div>
    );
  }
};

export interface IDataRowProps {
  cols: ISearchColumn[],
  item: any,
}

export class DefaultTableRow extends React.Component<IDataRowProps> {
  public render() {
    const { cols, item } = this.props;
    return (
      <div className={`table-row small`}>
        {cols.map(col => {
          const Renderer = col.cellRenderer;
          return <Renderer key={col.key} col={col} item={item}/>
        })}
      </div>
    )
  }
}


export interface IDefaultTableBodyProps {
  type: ISearchResultType;
  items: any[];
}

export class DefaultTableBody extends React.Component<IDefaultTableBodyProps> {
  public render() {
    const { items, type } = this.props;
    return (
      <div className="table-contents flex-fill">
        {items.map(item => (
          <DefaultTableRow key={type.itemKeyFn(item)} item={item} cols={type.columns}/>
        ))}
      </div>
    )
  }
}

