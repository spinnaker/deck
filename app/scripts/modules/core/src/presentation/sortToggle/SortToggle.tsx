import * as React from 'react';
import * as classNames from 'classnames';
import { BindAll } from 'lodash-decorators';

import { noop } from 'core/utils';

export interface ISortToggleProps {
  currentSort: string;
  label: string;
  onChange?: (newVal: string) => void;
  sortKey: string;
}

@BindAll()
export class SortToggle extends React.Component<ISortToggleProps> {
  public static defaultProps: Partial<ISortToggleProps> = {
    onChange: noop,
  };

  private isSortKey(): boolean {
    const { sortKey, currentSort } = this.props;
    const field = sortKey;
    return field === currentSort || field === '-' + currentSort;
  }

  private isReverse(): boolean {
    return this.props.sortKey && this.props.sortKey.startsWith('-');
  }

  private setSortKey(event: React.MouseEvent<HTMLElement>): void {
    const { currentSort, onChange } = this.props;
    event.preventDefault();
    const predicate = this.isSortKey() && this.isReverse() ? '' : '-';
    onChange(predicate + currentSort);
  }

  public render() {
    const isSortKey = this.isSortKey();
    const className = classNames({
      'inactive-sort-key': !isSortKey,
      'sort-toggle': true,
      clickable: true,
    });
    return (
      <span
        className={className}
        onClick={this.setSortKey}
      >
        {this.props.label}
        <a>
          {(!this.isReverse() || !isSortKey) && (
            <span className="glyphicon glyphicon-Down-triangle"/>
          )}
          {(this.isReverse() && isSortKey) && (
            <span className="glyphicon glyphicon-Up-triangle"/>
          )}
        </a>
      </span>
    );
  }

}
