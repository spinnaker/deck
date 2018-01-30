import * as React from 'react';
import { MouseEvent } from 'react';
import { UISref } from '@uirouter/react';
import { UIRouterContext } from '@uirouter/react-hybrid';

import { ISearchResult } from 'core/search/infrastructure/SearchResultPods';
import { Tooltip } from 'core/presentation';

import { SearchResult } from './SearchResult';

export interface ISearchResultPodItemProps {
  categoryName: string;
  result: ISearchResult;
  onRemoveItem: (categoryName: string, itemId: string) => void;
}

@UIRouterContext
export class SearchResultPodItem extends React.Component<ISearchResultPodItemProps> {
  private handleRemoveClicked(evt: MouseEvent<any>, categoryName: string, itemId: string) {
      evt.preventDefault();
      this.props.onRemoveItem(categoryName, itemId);
  }

  public render() {
    const { categoryName, result, onRemoveItem } = this.props;
    const showRemoveButton = !!onRemoveItem;
    const params = result.params || {};
    const account = result.account || params.account || params.accountId || params.accountName;

    return (
      <UISref to={result.state} params={result.params}>
        <a target="_self" className="list-group-item">
          <SearchResult displayName={result.displayName} account={account}/>

          {showRemoveButton && (
            <span className="small clickable remove-result-link" onClick={evt => this.handleRemoveClicked(evt, categoryName, result.id)} >
              <Tooltip value="remove from history" placement="left" delayShow={300}>
                <span className="glyphicon glyphicon-remove"/>
              </Tooltip>
            </span>
          )}
        </a>
      </UISref>
    );
  }
}
