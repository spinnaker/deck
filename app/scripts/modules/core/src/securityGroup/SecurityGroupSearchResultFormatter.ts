import { IPromise } from 'angular';

import { $q } from 'ngimport';

import { ISearchResult, ISearchResultType, searchResultFormatterRegistry } from '../search';
import { SecurityGroupDisplayRenderer } from './SecurityGroupDisplayRenderer';

export interface ISecurityGroupSearchResult extends ISearchResult {
  name: string;
  region: string;
  application: string;
}

export class SecurityGroupSearchResultFormatter implements ISearchResultType {
  public id = 'securityGroups';
  public displayName = 'Security Groups';
  public order = 6;
  public icon = 'exchange';
  public displayRenderer = SecurityGroupDisplayRenderer.renderer();

  public displayFormatter(searchResult: ISecurityGroupSearchResult): IPromise<string> {
    return $q.when(searchResult.name + ' (' + searchResult.region + ')');
  }
}

searchResultFormatterRegistry.register('securityGroups', new SecurityGroupSearchResultFormatter());
