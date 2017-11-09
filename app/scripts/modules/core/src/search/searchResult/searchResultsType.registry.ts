import { IPromise } from 'angular';
import { ISearchResult } from '../search.service';
import { ISearchColumn } from 'core';
import { ISearchResultTabProps } from 'core/search/searchResult/SearchResultTab';

export interface IResultDisplayFormatter {
  (entry: ISearchResult, fromRoute?: boolean): IPromise<string>;
}

export interface IResultRenderer {
  scrollToTop: () => void;
  render: (items: any[]) => JSX.Element;
}

export interface ISearchResultType {
  /** The unique key for the type, i.e., 'applications', 'serverGroup' */
  id: string;
  columns: ISearchColumn[];

  /** A function that creates a unique key for each item (for React key={}) */
  itemKeyFn: (item: any) => string;
  itemSortFn: (a: any, b: any) => number;

  /** The name to display on the grouping tab */
  displayName: string; // Name on tab
  displayFormatter: IResultDisplayFormatter;
  displayRenderer?: IResultRenderer;
  hideIfEmpty?: boolean;
  icon?: string;
  iconClass?: string;
  order: number;
  requiredSearchFields?: string[];

  renderers?: {
    /** renders the tab button used to activate the search results for this ISearchResultType */
    SearchResultTab: React.ComponentType<ISearchResultTabProps>;
    /** renders the faux-table column headers */
    SearchResultsHeader: React.ComponentType<{ type: ISearchResultType }>;
    /** renders the faux-table search result data rows and cells */
    SearchResultsData: React.ComponentType<{ type: ISearchResultType, results: any[] }>;
  }
}

export class SearchResultTypeRegistry {
  private types: ISearchResultType[] = [];

  public register(searchResultType: ISearchResultType): void {
    this.types.push(searchResultType);
  }

  public get(typeId: string): ISearchResultType {
    return this.types.find(f => f.id === typeId);
  }

  public getAll(): ISearchResultType[] {
    return this.types.slice().sort((a, b) => a.order - b.order);
  }

  public getSearchCategories(): string[] {
    return this.types.map(f => f.id);
  }
}

export const searchResultTypeRegistry = new SearchResultTypeRegistry();
