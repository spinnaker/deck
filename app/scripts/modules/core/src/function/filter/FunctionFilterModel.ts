import { IFunctionGroup } from 'core/domain';
import { IFilterConfig, IFilterModel } from 'core/filterModel/IFilterModel';
import { FilterModelService } from 'core/filterModel';

export const filterModelConfig: IFilterConfig[] = [
  { model: 'account', param: 'acct', type: 'trueKeyObject' },
  { model: 'detail', param: 'detail', type: 'trueKeyObject' },
  { model: 'filter', param: 'q', clearValue: '', type: 'string', filterLabel: 'search' },
  { model: 'providerType', type: 'trueKeyObject', filterLabel: 'provider' },
  { model: 'region', param: 'reg', type: 'trueKeyObject' },
];

export interface IFunctionFilterModel extends IFilterModel {
  groups: IFunctionGroup[];
}

export class FunctionFilterModel {
  public asFilterModel: IFunctionFilterModel;

  constructor() {
    this.asFilterModel = FilterModelService.configureFilterModel(this as any, filterModelConfig);
    FilterModelService.registerRouterHooks(this.asFilterModel, '**.application.insight.functions.**');
    this.asFilterModel.activate();
  }
}
