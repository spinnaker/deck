import { mockHttpClient } from '../api/mock/jasmine';
import type { IRootScopeService, IScope } from 'angular';
import { mock } from 'angular';

import { SubnetReader } from './subnet.read.service';
import type { ISubnet } from '../domain';

describe('SubnetReader', function () {
  let $scope: IScope;

  beforeEach(
    mock.inject(function ($rootScope: IRootScopeService) {
      $scope = $rootScope.$new();
    }),
  );

  it('adds label to subnet, including (deprecated) if deprecated field is true', async function () {
    const http = mockHttpClient();
    http
      .expectGET('/subnets')
      .respond(200, [
        { purpose: 'internal', deprecated: true },
        { purpose: 'external', deprecated: false },
        { purpose: 'internal' },
      ]);

    let result: ISubnet[] = null;

    SubnetReader.listSubnets().then((subnets: ISubnet[]) => {
      result = subnets;
    });

    await http.flush();
    $scope.$digest();

    expect(result[0].label).toBe('internal (deprecated)');
    expect(result[0].deprecated).toBe(true);
    expect(result[1].label).toBe('external');
    expect(result[1].deprecated).toBe(false);
    expect(result[2].label).toBe('internal');
    expect(result[2].deprecated).toBe(false);
  });
});
