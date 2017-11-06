import * as React from 'react';
import * as classNames from 'classnames';
import { BindAll } from 'lodash-decorators';

import { SearchService } from 'core/search/search.service';
import { ISearchResultType } from 'core';

export interface ISearchResultGroup {
  type: ISearchResultType;
  results: any[];
}

export interface ISearchResultGroupProps {
  isActive: boolean;
  searchResultGroup: ISearchResultGroup,
  onClick?: (group: ISearchResultGroup) => void;
}

@BindAll()
export class SearchResultGroup extends React.Component<ISearchResultGroupProps> {

  public static defaultProps: Partial<ISearchResultGroupProps> = {
    onClick: () => {}
  };

  private handleClick(): void {
    const { searchResultGroup, onClick } = this.props;
    if (searchResultGroup.results.length > 0) {
      onClick(searchResultGroup);
    }
  }

  private getCountLabel(count: number): string {

    let result = `${count}`;
    if (count >= SearchService.DEFAULT_PAGE_SIZE) {
      result += '+';
    }

    return result;
  }

  public render(): React.ReactElement<SearchResultGroup> {
    const { isActive, searchResultGroup } = this.props;
    const { type, results } = searchResultGroup;
    const iconClass = type.icon ? `fa fa-${type.icon}` : type.iconClass;

    const className = classNames({
      'search-group': true,
      'search-group--focus': isActive,
      'search-group--blur': !isActive,
      'faded': results.length === 0
    });

    return (
      <div className={className} onClick={this.handleClick}>
        <span className={`search-group-icon ${iconClass}`}/>
        <div className="search-group-name">{type.displayName}</div>
        <div className="badge">{this.getCountLabel(results.length)}</div>
      </div>
    );
  }
}
