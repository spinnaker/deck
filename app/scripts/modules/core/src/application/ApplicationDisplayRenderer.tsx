import { IApplicationSearchResult } from 'core/domain';
import {
  AbstractBaseResultRenderer, ITableColumn, AccountCellRenderer, DefaultCellRenderer, HrefCellRenderer,
} from 'core/search/searchResult/AbstractBaseResultRenderer';

import './application.less';

export class ApplicationDisplayRenderer extends AbstractBaseResultRenderer<IApplicationSearchResult> {
  private static instance: ApplicationDisplayRenderer = new ApplicationDisplayRenderer();

  private COLS = {
    APPLICATION: { key: 'application', label: 'Name', cellRenderer: HrefCellRenderer },
    ACCOUNTS: { key: 'accounts', label: 'Account', cellRenderer: AccountCellRenderer },
    EMAIL: { key: 'email', label: 'Owner Email', cellRenderer: DefaultCellRenderer }
  };

  public static renderer() {
    return ApplicationDisplayRenderer.instance;
  }

  public getColumnConfig(): ITableColumn<IApplicationSearchResult>[] {
    const { APPLICATION, ACCOUNTS, EMAIL } = this.COLS;
    return [ APPLICATION, ACCOUNTS, EMAIL ];
  }

  public getRendererClass(): string {
    return 'application';
  }

  public getKey(item: IApplicationSearchResult): string {
    return item.application;
  }

  public sortItems(items: IApplicationSearchResult[]): IApplicationSearchResult[] {
    return items.sort((a, b) => a.application.localeCompare(b.application));
  }
}
