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
  type: ISearchResultType;
  resultsCount: number;
  isActive: boolean;
  onClick?: (group: ISearchResultType) => void;
}

@BindAll()
export class SearchResultGroup extends React.Component<ISearchResultGroupProps> {
  private handleClick(): void {
    const { type, resultsCount, onClick } = this.props;
    resultsCount && onClick && onClick(type);
  }

  public render(): React.ReactElement<SearchResultGroup> {
    const { isActive, type, resultsCount } = this.props;
    const iconClass = type.icon ? `fa fa-${type.icon}` : type.iconClass;
    const countLabel = resultsCount < SearchService.DEFAULT_PAGE_SIZE ? `${resultsCount}` : `${resultsCount}+`;

    const className = classNames({
      'search-group': true,
      'search-group--focus': isActive,
      'search-group--blur': !isActive,
      'faded': resultsCount === 0
    });

    return (
      <div className={className} onClick={this.handleClick}>
        <span className={`search-group-icon ${iconClass}`}/>
        <div className="search-group-name">{type.displayName}</div>
        <div className="badge">{countLabel}</div>
      </div>
    );
  }
}
