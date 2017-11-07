import * as React from 'react';
import { BindAll } from 'lodash-decorators';

import { ISearchResultType } from './searchResultFormatter.registry';
import { SearchStatus } from './SearchResults';

export interface ISearchResultGridProps {
  searchStatus: SearchStatus;
  searchResultFormatter: ISearchResultType;
  searchResults: any[];
}

@BindAll()
export class SearchResultGrid extends React.Component<ISearchResultGridProps> {

  public componentDidUpdate(): void {
    const { searchResultFormatter } = this.props;
    if (searchResultFormatter) {
      searchResultFormatter.displayRenderer.scrollToTop();
    }
  }

  public render(): React.ReactElement<SearchResultGrid> {
    const { searchStatus, searchResultFormatter, searchResults } = this.props;

    const NoQuery = () => (
      <div className="flex-center">
        <h2>Please enter a search query to get started</h2>
      </div>
    );

    const NoResults = () => (
      <div className="flex-center">
        <h2>No results found for the specified search query</h2>
      </div>
    );

    const Searching = () => (
      <div className="load large flex-center">
        <div className="message">Fetching search results...</div>
        <div className="bars">
          <div className="bar full"/>
          <div className="bar"/>
          <div className="bar"/>
          <div className="bar"/>
          <div className="bar"/>
        </div>
      </div>
    );


    switch (searchStatus) {
      case SearchStatus.INITIAL:
        return <NoQuery/>;
      case SearchStatus.SEARCHING:
        return <Searching/>;
      case SearchStatus.NO_RESULTS:
        return <NoResults/>;
      case SearchStatus.FINISHED:
        return (
          <div className="search-result-grid flex-fill" style={{ height: 'initial' }}>
            {searchResultFormatter.displayRenderer.render(searchResults)}
          </div>
        );
      default:
        return null;
    }
  }
}
