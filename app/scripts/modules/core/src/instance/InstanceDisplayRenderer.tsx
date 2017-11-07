import {
  AbstractBaseResultRenderer,
  IInstanceSearchResult,
  ITableColumn,
  HrefCellRenderer,
  AccountCellRenderer,
  DefaultCellRenderer,
  ValueOrDefaultCellRenderer,
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

  public getColumnConfig(): ITableColumn<IInstanceSearchResult>[] {
    return [
      { key: 'instanceId', label: 'Instance ID', cellRenderer: HrefCellRenderer },
      { key: 'account', cellRenderer: AccountCellRenderer },
      { key: 'region', cellRenderer: DefaultCellRenderer },
      { key: 'serverGroup', label: 'Server Group', defaultValue: 'Standalone Instance', cellRenderer: ValueOrDefaultCellRenderer }
    ];
  }
}
