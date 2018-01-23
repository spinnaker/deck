import * as DOMPurify from 'dompurify';
import * as React from 'react';

import { AccountTag } from 'core/account';
import { IRecentHistoryEntry } from 'core/history';

export interface ISearchResultProps {
  item: IRecentHistoryEntry & { account?: string; displayName?: string };
}

export class SearchResult extends React.Component<ISearchResultProps> {
  public render() {
    const { item } = this.props;
    const params = item.params || {};
    const account = item.account || params.account || params.accountId || params.accountName;

    return (
      <span className="search-result">
        <AccountTag account={account} />
        <span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(item.displayName) }}/>
      </span>
    );
  }
}
