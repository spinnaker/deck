import { IPromise } from 'angular';

import { $q } from 'ngimport';

import { ISearchResult, searchResultTypeRegistry } from '../search';
import { SecurityGroupDisplayRenderer } from './SecurityGroupDisplayRenderer';

export interface ISecurityGroupSearchResult extends ISearchResult {
  name: string;
  region: string;
  application: string;
}

searchResultTypeRegistry.register({
    id: 'securityGroups',
    displayName: 'Security Groups',
    order: 6,
    icon: 'exchange',
    displayRenderer: SecurityGroupDisplayRenderer.renderer(),

    displayFormatter(searchResult: ISecurityGroupSearchResult): IPromise<string> {
      return $q.when(searchResult.name + ' (' + searchResult.region + ')');
    }
  }
);
