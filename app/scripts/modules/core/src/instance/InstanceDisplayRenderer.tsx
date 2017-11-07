import {
  AbstractBaseResultRenderer,
  IInstanceSearchResult,
  ITableColumnConfigEntry
} from '../search';

import './instance.less';

export class InstanceDisplayRenderer extends AbstractBaseResultRenderer<IInstanceSearchResult> {

  private static instance: InstanceDisplayRenderer = new InstanceDisplayRenderer();

  public static renderer() {
    return InstanceDisplayRenderer.instance;
  }

  public getRendererClass(): string {
    return 'instance';
  }

  public getKey(item: IInstanceSearchResult): string {
    return item.instanceId;
  }

  public sortItems(items: IInstanceSearchResult[]): IInstanceSearchResult[] {
    return items.sort((a, b) => a.instanceId.localeCompare(b.instanceId));
  }

  public getColumnConfig(): ITableColumnConfigEntry<IInstanceSearchResult>[] {
    return [
      { key: 'instanceId', label: 'Instance ID', cellRenderer: this.HrefCellRenderer },
      { key: 'account', cellRenderer: this.AccountCellRenderer },
      { key: 'region', cellRenderer: this.DefaultCellRender },
      { key: 'serverGroup', label: 'Server Group', defaultValue: 'Standalone Instance', cellRenderer: this.ValueOrDefaultCellRenderer }
    ];
  }
}
