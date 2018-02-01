import * as React from 'react';
import { UISref } from '@uirouter/react';

import { ISearchResultPodData } from 'core/search/infrastructure/SearchResultPods';
import { SearchResult } from 'core/search/infrastructure/SearchResult';

export interface IGlobalSearchRecentItemsProps {
  categories: ISearchResultPodData[];
  onItemKeyDown: (event: React.KeyboardEvent<HTMLAnchorElement>) => any;
  onResultClick: Function;
  resultRef: (categoryIndex: number, resultIndex: number, ref: HTMLAnchorElement) => any;
}

export function GlobalSearchRecentItems({
  categories,
  onItemKeyDown,
  onResultClick,
  resultRef
}: IGlobalSearchRecentItemsProps) {
  if (!categories.length) {
    return null;
  }

  return (
    <ul className="dropdown-menu" role="menu">
      {categories.map((category, categoryIndex) => ([
        <li key={category.category} className="category-heading">
          <div className="category-heading">Recent {category.category}</div>
        </li>,
        ...category.results.map((result, index) => {
          const params = result.params || {};
          const account = result.account || params.account || params.accountId || params.accountName;

          return (
            <li
              key={result.id}
              className="result"
              onClick={() => onResultClick()}
            >
              <UISref to={result.state} params={result.params}>
                <a
                  ref={(ref) => resultRef(categoryIndex, index, ref)}
                  onKeyDown={onItemKeyDown}
                >
                  <SearchResult displayName={result.displayName} account={account} />
                </a>
              </UISref>
            </li>
          );
        })
      ]))}
    </ul>
  );
}
