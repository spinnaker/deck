import { chain, find, forOwn, groupBy, intersection, sortBy, values } from 'lodash';
import { Debounce } from 'lodash-decorators';
import { Subject } from 'rxjs';

import { Application } from 'core/application/application.model';
import { FilterModelService } from 'core/filterModel';
import { IFunction, IFunctionGroup } from 'core/domain';
import { FunctionState } from 'core/state';

export class FunctionFilterService {
  public groupsUpdatedStream: Subject<IFunctionGroup[]> = new Subject<IFunctionGroup[]>();

  private lastApplication: Application;

  constructor() {
    this.isFilterable = FilterModelService.isFilterable;
    this.getCheckValues = FilterModelService.getCheckValues;
  }

  private addSearchFields(functionDef: IFunction): void {
    if (!functionDef.searchField) {
      functionDef.searchField = [functionDef.functionName, functionDef.region.toLowerCase(), functionDef.account].join(
        ' ',
      );
    }
  }

  private checkSearchTextFilter(functionDef: IFunction): boolean {
    const filter = FunctionState.filterModel.asFilterModel.sortFilter.filter;
    if (!filter) {
      return true;
    }

    if (filter.includes('vpc:')) {
      const [, vpcName] = /vpc:([\w-]*)/.exec(filter);
      return functionDef.vpcName.toLowerCase() === vpcName.toLowerCase();
    }
    this.addSearchFields(functionDef);
    return filter.split(' ').every((testWord: string) => {
      return functionDef.searchField.includes(testWord);
    });
  }

  public filterFunctionsForDisplay(functions: IFunction[]): IFunction[] {
    return chain(functions)
      .filter(fn => this.checkSearchTextFilter(fn))
      .filter(fn => FilterModelService.checkAccountFilters(FunctionState.filterModel.asFilterModel)(fn))
      .filter(fn => FilterModelService.checkRegionFilters(FunctionState.filterModel.asFilterModel)(fn))
      .filter(fn => FilterModelService.checkDetailFilters(FunctionState.filterModel.asFilterModel)(fn))
      .filter(fn => FilterModelService.checkProviderFilters(FunctionState.filterModel.asFilterModel)(fn))
      .value();
  }

  private diffSubgroups(oldGroups: IFunctionGroup[], newGroups: IFunctionGroup[]): void {
    const groupsToRemove: number[] = [];

    oldGroups.forEach((oldGroup, idx) => {
      const newGroup = find(newGroups, { heading: oldGroup.heading });
      if (!newGroup) {
        groupsToRemove.push(idx);
      } else {
        if (newGroup.functionDef) {
          oldGroup.functionDef = newGroup.functionDef;
        }

        if (newGroup.subgroups) {
          this.diffSubgroups(oldGroup.subgroups, newGroup.subgroups);
        }
      }
    });
    groupsToRemove.reverse().forEach(idx => {
      oldGroups.splice(idx, 1);
    });
    newGroups.forEach(newGroup => {
      const match = find(oldGroups, { heading: newGroup.heading });
      if (!match) {
        oldGroups.push(newGroup);
      }
    });
  }

  public sortGroupsByHeading(groups: IFunctionGroup[]): void {
    this.diffSubgroups(FunctionState.filterModel.asFilterModel.groups, groups);

    // sort groups in place so Angular doesn't try to update the world
    FunctionState.filterModel.asFilterModel.groups.sort((a, b) => {
      if (a.heading < b.heading) {
        return -1;
      }
      if (a.heading > b.heading) {
        return 1;
      }
      return 0;
    });
  }

  public clearFilters(): void {
    FunctionState.filterModel.asFilterModel.clearFilters();
    FunctionState.filterModel.asFilterModel.applyParamsToUrl();
  }

  @Debounce(25)
  public updateFunctionGroups(application: Application): void {
    if (!application) {
      application = this.lastApplication;
      if (!this.lastApplication) {
        return null;
      }
    }

    const groups: IFunctionGroup[] = [];
    const functions = this.filterFunctionsForDisplay(application.functions.data);
    const grouped = groupBy(functions, 'account');

    forOwn(grouped, (group, account) => {
      const groupedByRegion = values(groupBy(group, 'region'));
      const namesByRegion = groupedByRegion.map(g => g.map(fn => fn.functionName));
      const functionNames =
        namesByRegion.length > 1
          ? intersection(...namesByRegion).reduce<{ [key: string]: boolean }>((acc, name) => {
              acc[name] = true;
              return acc;
            }, {})
          : {};

      const subGroupings = groupBy(group, fn => `${fn.functionName}:${fn.region}`),
        subGroups: IFunctionGroup[] = [];

      forOwn(subGroupings, (subGroup, nameAndRegion) => {
        const [name, region] = nameAndRegion.split(':');
        const subSubGroups: IFunctionGroup[] = [];

        subGroup.forEach(functionDef => {
          subSubGroups.push({
            heading: functionDef.region,
            functionDef,
          });
        });

        const heading = `${name}${functionNames[name] && region ? ` (${region})` : ''}`;
        subGroups.push({
          heading,
          subgroups: sortBy(subSubGroups, 'heading'),
        });
      });
      groups.push({ heading: account, subgroups: sortBy(subGroups, 'heading') });
    });

    this.sortGroupsByHeading(groups);
    FunctionState.filterModel.asFilterModel.addTags();
    this.lastApplication = application;
    this.groupsUpdatedStream.next(groups);
  }
}
