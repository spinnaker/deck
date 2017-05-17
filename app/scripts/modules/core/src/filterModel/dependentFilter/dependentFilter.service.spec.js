'use strict';

describe('Service: dependentFilterService', function () {
  let service;

  beforeEach(
    window.module(
      require('./dependentFilter.service.js')
    )
  );

  beforeEach(
    window.inject(
      function (dependentFilterService) {
        service = dependentFilterService;
      }
    )
  );

  describe('digestDependentFilters', function () {
    let pool, dependencyOrder;
    beforeEach(function () {
      dependencyOrder = ['providerType', 'account', 'region', 'availabilityZone', 'instanceType'];

      pool = [{
          'providerType': 'aws',
          'account': 'my-aws-account',
          'region': 'us-west-2',
          'instanceType': 'm3.medium',
          'availabilityZone': 'us-west-2a'
        },
        {
          'providerType': 'aws',
          'account': 'my-aws-account',
          'region': 'us-west-2',
          'instanceType': 'm3.medium',
          'availabilityZone': 'us-west-2b'
        },
        {
          'providerType': 'gce',
          'account': 'my-google-account',
          'region': 'us-central1',
          'instanceType': 'f1-micro',
          'availabilityZone': 'us-central1-f'
        },
        {
          'providerType': 'gce',
          'account': 'my-google-account',
          'region': 'us-central1',
          'instanceType': 'f1-micro',
          'availabilityZone': 'us-central1-f'
        },
        {
          'providerType': 'gce',
          'account': 'my-google-account',
          'region': 'asia-east1',
          'instanceType': 'f1-micro',
          'availabilityZone': 'asia-east1-c'
        },
        {
          'providerType': 'gce',
          'account': 'my-other-google-account',
          'region': 'asia-east1',
          'instanceType': 'f1-micro',
          'availabilityZone': 'asia-east1-c'
        },
        {
          'providerType': 'gce',
          'account': 'my-google-account',
          'region': 'asia-east1',
          'instanceType': 'f1-micro',
          'availabilityZone': 'asia-east1-b'
        },
      ];
    });

    describe('parents filter children', function () {
      it('should return all headings for all fields when no headings selected', function () {
        let sortFilter = { region: {}, account: {}, availabilityZone: {}, providerType: {}, instanceType: {} };
        let { region, account, availabilityZone, providerType, instanceType } = service
          .digestDependentFilters({ sortFilter, pool, dependencyOrder });

        expect(region.length).toEqual(3);
        expect(account.length).toEqual(3);
        expect(availabilityZone.length).toEqual(5);
        expect(providerType.length).toEqual(2);
        expect(instanceType.length).toEqual(2);
      });

      it('should return all headings for all fields when only instance types selected', function () {
        let sortFilter = {
          region: {},
          account: {},
          availabilityZone: {},
          providerType: {},
          instanceType: { 'f1-micro' : true}
        };

        let { region, account, availabilityZone, providerType, instanceType } = service
          .digestDependentFilters({ sortFilter, pool, dependencyOrder });

        expect(region.length).toEqual(3);
        expect(account.length).toEqual(3);
        expect(availabilityZone.length).toEqual(5);
        expect(providerType.length).toEqual(2);
        expect(instanceType.length).toEqual(2);
      });

      it('should return all AZs and instance types when all regions selected', function () {
        let sortFilter = {
          region: { 'us-central1': true, 'asia-east1': true, 'us-west-2': true },
          account: {},
          availabilityZone: {},
          providerType: {},
          instanceType: {}
        };

        let { region, availabilityZone, instanceType } = service
          .digestDependentFilters({ sortFilter, pool, dependencyOrder });

        expect(region.length).toEqual(3);
        expect(availabilityZone.length).toEqual(5);
        expect(instanceType.length).toEqual(2);
      });

      it(`should return only Google regions, AZs, and instance types 
          when only my-google-account is selected`, function () {
        let sortFilter = {
          region: {},
          account: { 'my-google-account': true },
          availabilityZone: {},
          providerType: {},
          instanceType: {}
        };

        let { region, availabilityZone, instanceType } = service.digestDependentFilters({ sortFilter, pool, dependencyOrder });

        expect(region).toEqual(['us-central1', 'asia-east1']);
        expect(availabilityZone).toEqual(['us-central1-f', 'asia-east1-c', 'asia-east1-b']);
        expect(instanceType).toEqual(['f1-micro']);
      });

      it('should return asia-east1-c, asia-east1-b, and all regions when asia-east1 is selected', function () {
        let sortFilter = {
          region: { 'asia-east1': true },
          account: {},
          availabilityZone: {},
          providerType: {},
          instanceType: {}
        };
        let { region, availabilityZone } = service.digestDependentFilters({ sortFilter, pool, dependencyOrder });

        expect(region.length).toEqual(3);
        expect(availabilityZone).toEqual(['asia-east1-c', 'asia-east1-b']);
      });

      it(`should return us-west-2a, us-west-2b, and Amazon regions 
          when us-west-2 and my-aws-account are selected`, function () {
        let sortFilter = {
          region: { 'us-west-2': true },
          account: { 'my-aws-account': true },
          availabilityZone: {},
          providerType: {},
          instanceType: {}
        };

        let { region, availabilityZone } = service.digestDependentFilters({ sortFilter, pool, dependencyOrder });

        expect(region).toEqual(['us-west-2']);
        expect(availabilityZone).toEqual(['us-west-2a', 'us-west-2b']);
      });

      it('should return empty AZ and instance type lists and all regions when selected region has no AZs', function () {
        let sortFilter = {
          region: { 'eu-east1': true },
          account: {},
          availabilityZone: {},
          providerType: {},
          instanceType: {}
        };

        pool = pool.concat({ 'region': 'eu-east1' });

        let { region, availabilityZone, instanceType } = service.digestDependentFilters({ sortFilter, pool, dependencyOrder });

        expect(region.length).toEqual(4);
        expect(availabilityZone).toEqual([]);
        expect(instanceType).toEqual([]);
      });
    });

    describe('state management', function () {
      it(`should unselect us-west-2 region when only my-google-account selected,
          return values as if only my-google-account selected.`, function () {
        let sortFilter = {
          region: { 'us-west-2': true },
          account: { 'my-google-account': true },
          availabilityZone: {},
          providerType: {},
          instanceType: {},
        };
        let { region, availabilityZone } = service.digestDependentFilters({ sortFilter, pool, dependencyOrder });

        expect(region).toEqual(['us-central1', 'asia-east1']);
        expect(availabilityZone).toEqual(['us-central1-f', 'asia-east1-c', 'asia-east1-b']);
        expect(sortFilter.region['us-west-2']).not.toBeDefined();
      });

      it(`should unselect us-west-2a AZ when only my-google-account selected,
          return values as if only my-google-account selected`, function () {
        let sortFilter = {
          region: {},
          account: { 'my-google-account': true },
          availabilityZone: { 'us-west-2a': true }
        };
        let { region, availabilityZone } = service.digestDependentFilters({ sortFilter, pool, dependencyOrder });

        expect(region).toEqual(['us-central1', 'asia-east1']);
        expect(availabilityZone).toEqual(['us-central1-f', 'asia-east1-c', 'asia-east1-b']);
        expect(sortFilter.availabilityZone['us-west-2a']).not.toBeDefined();
      });

      it(`should unselect us-west-1 region and us-west-1a AZ when only my-google-account selected,
          return values as if only my-google-account selected`, function () {
        let sortFilter = {
          region: { 'us-west-2': true },
          account: { 'my-google-account': true },
          availabilityZone: { 'us-west-2a': true }
        };
        let { region, availabilityZone, instanceType } = service.digestDependentFilters({ sortFilter, pool, dependencyOrder });

        expect(region).toEqual(['us-central1', 'asia-east1']);
        expect(availabilityZone).toEqual(['us-central1-f', 'asia-east1-c', 'asia-east1-b']);
        expect(instanceType).toEqual(['f1-micro']);
        expect(sortFilter.availabilityZone['us-west-2a']).not.toBeDefined();
        expect(sortFilter.region['us-west-2']).not.toBeDefined();
      });

      it(`should unselect us-central1-f AZ if asia-east1 region is selected and us-central1 region is not`, function () {
        let sortFilter = {
          region: { 'asia-east1': true },
          account: {},
          availabilityZone: { 'us-central1-f': true }
        };
        let { region, availabilityZone, instanceType } = service.digestDependentFilters({ sortFilter, pool, dependencyOrder });

        expect(region.length).toEqual(3);
        expect(availabilityZone).toEqual(['asia-east1-c', 'asia-east1-b']);
        expect(instanceType).toEqual(['f1-micro']);
        expect(sortFilter.availabilityZone['us-central1-f']).not.toBeDefined();
      });

      it(`should unselect us-central1-f AZ if my-google-account and my-aws-account selected 
          and then my-google-account unselected`, function () {
        let sortFilter = {
          region: {},
          account: { 'my-google-account': true, 'my-aws-account': true },
          availabilityZone: { 'us-central1-f': true }
        };
        let { availabilityZone } = service.digestDependentFilters({ sortFilter, pool, dependencyOrder });

        expect(availabilityZone.length).toEqual(5);
        expect(sortFilter.availabilityZone['us-central1-f']).toEqual(true);

        sortFilter.account = { 'my-google-account': false, 'my-aws-account': true };
        let updated = service.digestDependentFilters({ sortFilter, pool, dependencyOrder });

        expect(updated.region.length).toEqual(1);
        expect(updated.availabilityZone.length).toEqual(2);
        expect(sortFilter.availabilityZone['us-central1-f']).not.toBeDefined();
      });

      it(`should not unselect asia-east1 region if my-google-account is unselected
          and my-other-google-account is selected`, function () {
        let sortFilter = {
          region: { 'asia-east1': true },
          account: { 'my-other-google-account': true },
          availabilityZone: { }
        };
        let { region, availabilityZone } = service.digestDependentFilters({ sortFilter, pool, dependencyOrder });

        expect(region).toEqual(['asia-east1']);
        expect(availabilityZone).toEqual(['asia-east1-c']);
        expect(sortFilter.region['asia-east1']).toBeDefined();
      });

      it(`should not unselect asia-east1 region if my-google-account and my-other-google-account selected 
          and then my-google-account unselected`, function () {
        let sortFilter = {
          region: { 'asia-east1': true, 'us-central1': true },
          account: { 'my-google-account': true, 'my-other-google-account': true },
          availabilityZone: { }
        };
        service.digestDependentFilters({ sortFilter, pool, dependencyOrder });

        expect(sortFilter.region['asia-east1']).toEqual(true);

        sortFilter.account = { 'my-google-account': false, 'my-other-google-account': true };
        service.digestDependentFilters({ sortFilter, pool, dependencyOrder });

        expect(sortFilter.region['asia-east1']).toBeDefined();
        expect(sortFilter.region['us-central1']).not.toBeDefined();
      });
    });
  });
});
