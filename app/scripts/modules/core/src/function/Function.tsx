import * as React from 'react';
import { UISref, UISrefActive } from '@uirouter/react';

import { Application } from 'core/application/application.model';
import { IFunction } from 'core/domain';

import { EntityNotifications } from 'core/entityTag/notifications/EntityNotifications';

export interface IFunctionProps {
  application: Application;
  functionDef: IFunction;
}

export class Function extends React.Component<IFunctionProps> {
  public static defaultProps: Partial<IFunctionProps> = {};

  public render(): React.ReactElement<Function> {
    const { application, functionDef } = this.props;
    const params = {
      application: application.name,
      region: functionDef.region,
      account: functionDef.account,
      name: functionDef.functionName,
      provider: functionDef.cloudProvider,
    };
    return (
      <div className="pod-subgroup function">
        <div className="function-header sticky-header-2">
          <UISrefActive class="active">
            <UISref to=".functionDetails" params={params}>
              <h6 className="clickable clickable-row horizontal middle">
                <i className="fa icon-sitemap" />
                &nbsp; {(functionDef.region || '').toUpperCase()}
                <div className="flex-1">
                  <EntityNotifications
                    entity={functionDef}
                    application={application}
                    placement="bottom"
                    entityType="function"
                    pageLocation="pod"
                    onUpdate={() => application.functions.refresh()}
                  />
                </div>
              </h6>
            </UISref>
          </UISrefActive>
        </div>
      </div>
    );
  }
}
