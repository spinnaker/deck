import * as React from 'react';
import { mock } from 'angular';
import { mount } from 'enzyme';

import { AuthenticationService } from 'core/authentication';
import { REACT_MODULE } from 'core/reactShims';
import {
  IPermissions,
  IPermissionsConfigurerProps,
  PermissionsConfigurer,
} from 'core/application/modal/PermissionsConfigurer';

describe('PermissionsConfigurer', () => {
  const createComponent = (props: IPermissionsConfigurerProps) => {
    return mount(<PermissionsConfigurer {...props} />).instance() as PermissionsConfigurer;
  };

  beforeEach(mock.module(REACT_MODULE));

  beforeEach(
    mock.inject(() => {
      spyOn(AuthenticationService, 'getAuthenticatedUser').and.callFake(() => {
        return { roles: ['groupA', 'groupB', 'groupC'] };
      });
    }),
  );

  it('converts legacy requiredGroupMembership list to permissions object', () => {
    let permissions: IPermissions;
    createComponent({
      permissions: null,
      requiredGroupMembership: ['groupA', 'groupB'],
      onPermissionsChange: (p: IPermissions) => {
        permissions = p;
      },
    });

    expect(permissions).toEqual({
      READ: ['groupA', 'groupB'],
      EXECUTE: ['groupA', 'groupB'],
      WRITE: ['groupA', 'groupB'],
    });
  });

  it('supports old READ/WRITE permissions by adding EXECUTE implicitly', () => {
    const component = createComponent({
      permissions: {
        READ: ['my-team'],
        WRITE: ['my-team'],
      } as IPermissions,
      requiredGroupMembership: null,
      onPermissionsChange: () => null,
    });

    expect(component.state.permissionRows).toEqual([
      {
        group: 'my-team',
        access: 'READ,EXECUTE,WRITE',
      },
    ]);
  });

  it(`populates the 'roleOptions' list with a user's roles minus the roles already used in the permissions object`, () => {
    const component = createComponent({
      permissions: { READ: ['groupA', 'groupB'], EXECUTE: ['groupB'], WRITE: ['groupB'] },
      requiredGroupMembership: null,
      onPermissionsChange: () => null,
    });

    expect(component.state.roleOptions.map(option => option.value)).toEqual(['groupC']);
  });
});
