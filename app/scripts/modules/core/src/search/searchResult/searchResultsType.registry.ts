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
  private formatters: ISearchResultType[] = [];

  public register(formatter: ISearchResultType): void {
    this.formatters.push(formatter);
  }

  public get(typeId: string): ISearchResultType {
    return this.formatters.find(f => f.id === typeId);
  }

  public getAll(): ISearchResultType[] {
    return this.formatters.slice().sort((a, b) => a.order - b.order);
  }

  public getSearchCategories(): string[] {
    return this.formatters.map(f => f.id);
  }
}

export const searchResultTypeRegistry = new SearchResultTypeRegistry();
