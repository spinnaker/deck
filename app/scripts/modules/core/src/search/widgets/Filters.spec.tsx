import * as React from 'react';
import { ReactWrapper, mount } from 'enzyme';

import { IFilterType } from './SearchFilterTypeRegistry';
import { IFiltersLayout, IFiltersProps, Filters } from './Filters';

describe('<Filters/>', () => {

  let component: ReactWrapper<IFiltersProps, any>;

  function getNewFilterType(seed: number): IFilterType {
    return {
      key: 'region',
      modifier: 'reg',
      text: `us-west-${seed}`
    };
  }

  function getNewLayout(seed: number): IFiltersLayout {
    return {
      header: `header_${seed}`,
      filterTypes: [1, 2, 3].map((s: number) => getNewFilterType(s))
    };
  }

  function getNewFilters(isOpen: boolean): ReactWrapper<IFiltersProps, any> {

    const activeFilter = getNewFilterType(1);
    return mount(
      <Filters
        activeFilter={activeFilter}
        layouts={[1, 2].map((seed: number) => getNewLayout(seed))}
        isOpen={isOpen}
      />
    );
  }

  it('should render a list of filters', () => {
    component = getNewFilters(true);
    expect(component.hasClass('filter-list')).toBeTruthy();
  });

  it('should open the filter list when isOpen is true', () => {
    component = getNewFilters(true);
    expect(component.hasClass('filter-list')).toBeTruthy();
    expect(component.hasClass('filter-list__open')).toBeTruthy();
    expect(component.hasClass('filter-list__closed')).toBeFalsy();
  });

  it('should close the filter list when isOpen is false', () => {
    component = getNewFilters(false);
    expect(component.hasClass('filter-list')).toBeTruthy();
    expect(component.hasClass('filter-list__open')).toBeFalsy();
    expect(component.hasClass('filter-list__closed')).toBeTruthy();
  });
});
