import * as React from 'react';
import { kebabCase } from 'lodash';

import { Spinner } from 'core/widgets';

import { ISearchResultSet } from '../infrastructure/infrastructureSearch.service';
import { SearchStatus } from './SearchResults';

export interface ISearchResultGridProps {
  resultSet: ISearchResultSet;
}

const NoQuery = () => (
  <div className="flex-fill vertical center middle">
    <h2>Please enter a search query to get started</h2>
  </div>
);

const Searching = () => (
  <div className="flex-fill vertical center middle">
    <Spinner size="large" message="Fetching search results ..."/>
  </div>
);

const NoResults = ({ resultSet }: { resultSet: ISearchResultSet }) => (
  <div className="flex-fill vertical center middle">
    <h3>No {resultSet.type.displayName} found for the specified search query</h3>
  </div>
);

const Results = ({ resultSet }: { resultSet: ISearchResultSet }) => {
  const { results, type } = resultSet;
  const { SearchResultsHeader, SearchResultsData } = type.components;

  return (
    <div className="search-result-grid flex-fill" style={{ height: 'initial' }}>
      <div className={`table table-search-results table-search-results-${kebabCase(type.id)}`}>
        <SearchResultsHeader type={type}/>
        <SearchResultsData type={type} results={results}/>
      </div>
    </div>
  )
};

const FetchError = ({ resultSet }: { resultSet: ISearchResultSet }) => (
  <div className="flex-fill vertical center middle">
    <h4 className="error-message">Could not fetch {resultSet.type.displayName}</h4>
    <div className="error-message">{resultSet && resultSet.error && resultSet.error.toString()}</div>
  </div>
);

export class SearchResultGrid extends React.Component<ISearchResultGridProps> {
  public render(): React.ReactElement<SearchResultGrid> {
    const resultSet = this.props.resultSet || {} as ISearchResultSet;
    const { status, results } = resultSet;

    switch (status) {
      case SearchStatus.INITIAL:
      case undefined:
        return <NoQuery/>;

      case SearchStatus.ERROR:
        return <FetchError resultSet={resultSet}/>;

      case SearchStatus.SEARCHING:
        return <Searching/>;

      case SearchStatus.FINISHED:
        if (!results.length) {
          return <NoResults resultSet={resultSet}/>;
        }

        return <Results resultSet={resultSet}/>;
      default:
        return null;
    }
  }
}
