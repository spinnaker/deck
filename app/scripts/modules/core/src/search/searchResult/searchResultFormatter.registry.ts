import { IPromise } from 'angular';
import { ISearchResult } from '../search.service';

export interface IResultDisplayFormatter {
  (entry: ISearchResult, fromRoute?: boolean): IPromise<string>;
}

export interface IResultRenderer {
  scrollToTop: () => void;
  render: (items: any[]) => JSX.Element;
}

export interface ISearchResultType {
  id: string;
  displayName: string; // Name on tab
  displayFormatter: IResultDisplayFormatter;
  displayRenderer?: IResultRenderer;
  hideIfEmpty?: boolean;
  icon?: string;
  iconClass?: string;
  order: number;
  requiredSearchFields?: string[];
}

export class SearchResultTypeRegistry {
  private formatters: {[key: string]: ISearchResultType} = {};

  public register(formatter: ISearchResultType): void {
    this.formatters[formatter.id] = formatter;
  }

  public get(type: string): ISearchResultType {
    return this.formatters[type];
  }

  public getSearchCategories(): string[] {
    return Object.keys(this.formatters);
  }
}

export const searchResultFormatterRegistry = new SearchResultTypeRegistry();
