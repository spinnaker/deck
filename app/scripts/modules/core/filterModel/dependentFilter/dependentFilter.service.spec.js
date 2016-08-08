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
    let dependencies;
    beforeEach(function () {
      dependencies = [
        {
          child: 'region', parent: 'account',
          childKeyedByParent: {
            'my-aws-account': ['us-west-1', 'us-east-2', 'eu-east-2'],
            'my-google-account': ['us-central1', 'asia-east1', 'europe-west1'],
            'my-other-google-account': ['us-central1'],
          }
        },
        {
          child: 'availabilityZone', parent: 'region',
          childKeyedByParent: {
            'us-central1': ['us-central1-f'],
            'asia-east1': ['asia-east1-a'],
            'europe-west1': ['europe-west1-b'],
            'us-west-1': ['us-west-1a', 'us-west-1b'],
            'eu-east-2': [],
            'us-east-2': ['us-east-2c']
          }
        }];
    });

    describe('parents filter children', function () {
      it('should return all regions and AZs when no accounts, regions, or AZs selected', function () {
        let sortFilter = { region: {}, account: {}, availabilityZone: {} };
        let { region, availabilityZone } = service.digestDependentFilters({ sortFilter, dependencies });

        expect(region.length).toEqual(6);
        expect(availabilityZone.length).toEqual(6);
      });

      it('should return all regions and AZs when only AZs selected', function () {
        let sortFilter = { region: {}, account: {}, availabilityZone: { 'us-west-1a': true, 'asia-east1-a': true } };
        let { region, availabilityZone } = service.digestDependentFilters({ sortFilter, dependencies });

        expect(region.length).toEqual(6);
        expect(availabilityZone.length).toEqual(6);
      });

      it('should return all AZs when all regions selected', function () {
        let sortFilter = {
          region: {
            'us-central1': true,
            'asia-east1': true,
            'europe-west1': true,
            'us-west-1': true,
            'eu-east-2': true,
            'us-east-2': true
          }, account: {}, availabilityZone: {}
        };
        let { region, availabilityZone } = service.digestDependentFilters({ sortFilter, dependencies });

        expect(region.length).toEqual(6);
        expect(availabilityZone.length).toEqual(6);
      });

      it('should return only Google regions and AZs when only my-google-account is selected', function () {
        let sortFilter = { region: {}, account: { 'my-google-account': true }, availabilityZone: {} };
        let { region, availabilityZone } = service.digestDependentFilters({ sortFilter, dependencies });

        expect(region).toEqual(['us-central1', 'asia-east1', 'europe-west1']);
        expect(availabilityZone).toEqual(['us-central1-f', 'asia-east1-a', 'europe-west1-b']);
      });

      it('should return us-west-1a, us-west-1b, and all regions when us-west-1 is selected', function () {
        let sortFilter = { region: { 'us-west-1': true }, account: {}, availabilityZone: {} };
        let { region, availabilityZone } = service.digestDependentFilters({ sortFilter, dependencies });

        expect(region.length).toEqual(6);
        expect(availabilityZone).toEqual(['us-west-1a', 'us-west-1b']);
      });

      it(`should return us-west-1a, us-west-1b, and Amazon regions 
          when us-west1 and my-aws-account are selected`, function () {
        let sortFilter = { region: { 'us-west-1': true }, account: { 'my-aws-account': true }, availabilityZone: {} };
        let { region, availabilityZone } = service.digestDependentFilters({ sortFilter, dependencies });

        expect(region).toEqual(['us-west-1', 'us-east-2', 'eu-east-2']);
        expect(availabilityZone).toEqual(['us-west-1a', 'us-west-1b']);
      });

      it('should return an empty AZ list and all regions when selected region has no AZs', function () {
        let sortFilter = { region: { 'eu-east-2': true }, account: {}, availabilityZone: {} };
        let { region, availabilityZone } = service.digestDependentFilters({ sortFilter, dependencies });

        expect(region.length).toEqual(6);
        expect(availabilityZone).toEqual([]);
      });
    });

    describe('state management', function () {
      it(`should unselect us-west-1 region when only my-google-account selected,
          return values as if only my-google-account selected.`, function () {
        let sortFilter = {
          region: { 'us-west-1': true },
          account: { 'my-google-account': true },
          availabilityZone: {}
        };
        let { region, availabilityZone } = service.digestDependentFilters({ sortFilter, dependencies });

        expect(region).toEqual(['us-central1', 'asia-east1', 'europe-west1']);
        expect(availabilityZone).toEqual(['us-central1-f', 'asia-east1-a', 'europe-west1-b']);
        expect(sortFilter.region['us-west-1']).not.toBeDefined();
      });

      it(`should unselect us-west-1a AZ when only my-google-account selected,
          return values as if only my-google-account selected`, function () {
        let sortFilter = {
          region: {},
          account: { 'my-google-account': true },
          availabilityZone: { 'us-west-1a': true }
        };
        let { region, availabilityZone } = service.digestDependentFilters({ sortFilter, dependencies });

        expect(region).toEqual(['us-central1', 'asia-east1', 'europe-west1']);
        expect(availabilityZone).toEqual(['us-central1-f', 'asia-east1-a', 'europe-west1-b']);
        expect(sortFilter.availabilityZone['us-west-1a']).not.toBeDefined();
      });

      it(`should unselect us-west-1 region and us-west-1a AZ when only my-google-account selected,
          return values as if only my-google-account selected`, function () {
        let sortFilter = {
          region: { 'us-west-1': true },
          account: { 'my-google-account': true },
          availabilityZone: { 'us-west-1a': true }
        };
        let { region, availabilityZone } = service.digestDependentFilters({ sortFilter, dependencies });

        expect(region).toEqual(['us-central1', 'asia-east1', 'europe-west1']);
        expect(availabilityZone).toEqual(['us-central1-f', 'asia-east1-a', 'europe-west1-b']);
        expect(sortFilter.availabilityZone['us-west-1a']).not.toBeDefined();
        expect(sortFilter.region['us-west-1']).not.toBeDefined();
      });

      it(`should unselect us-west-1a AZ if eu-east-2 region is selected and us-west-1 region is not`, function () {
        let sortFilter = {
          region: { 'us-east-2': true },
          account: {},
          availabilityZone: { 'us-west-1a': true }
        };
        let { region, availabilityZone } = service.digestDependentFilters({ sortFilter, dependencies });

        expect(region.length).toEqual(6);
        expect(availabilityZone).toEqual(['us-east-2c']);
        expect(sortFilter.availabilityZone['us-west-1a']).not.toBeDefined();
      });

      it(`should unselect us-central1-f AZ if my-google-account and my-aws-account selected 
          and then my-google-account unselected`, function () {
        let sortFilter = {
          region: {},
          account: { 'my-google-account': true, 'my-aws-account': true },
          availabilityZone: { 'us-central1-f': true }
        };
        let { region, availabilityZone } = service.digestDependentFilters({ sortFilter, dependencies });

        expect(region.length).toEqual(6);
        expect(availabilityZone.length).toEqual(6);
        expect(sortFilter.availabilityZone['us-central1-f']).toEqual(true);

        sortFilter.account = { 'my-google-account': false, 'my-aws-account': true };
        let updated = service.digestDependentFilters({ sortFilter, dependencies });

        expect(updated.region.length).toEqual(3);
        expect(updated.availabilityZone.length).toEqual(3);
        expect(sortFilter.availabilityZone['us-central1-f']).not.toBeDefined();
      });

      it(`should not unselect us-central1 region if my-google-account is unselected
          and my-other-google-account is selected`, function () {
        let sortFilter = {
          region: { 'us-central1': true },
          account: { 'my-other-google-account': true },
          availabilityZone: { }
        };
        let { region, availabilityZone } = service.digestDependentFilters({ sortFilter, dependencies });

        expect(region).toEqual(['us-central1']);
        expect(availabilityZone).toEqual(['us-central1-f']);
        expect(sortFilter.region['us-central1']).toBeDefined();
      });

      it(`should not unselect us-central1 region if my-google-account and my-other-google-account selected 
          and then my-google-account unselected`, function () {
        let sortFilter = {
          region: { 'us-central1': true },
          account: { 'my-google-account': true, 'my-other-google-account': true },
          availabilityZone: { }
        };
        service.digestDependentFilters({ sortFilter, dependencies });

        expect(sortFilter.region['us-central1']).toEqual(true);

        sortFilter.account = { 'my-google-account': false, 'my-other-google-account': true };
        service.digestDependentFilters({ sortFilter, dependencies });

        expect(sortFilter.region['us-central1']).toBeDefined();
        expect(sortFilter.region['asia-east1']).not.toBeDefined();
        expect(sortFilter.region['europe-west1']).not.toBeDefined();
      });
    });
  });
});
