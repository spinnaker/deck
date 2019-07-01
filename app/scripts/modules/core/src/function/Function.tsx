import * as React from 'react';
<<<<<<< HEAD
// import { UISref, UISrefActive } from '@uirouter/react';
<<<<<<< HEAD:app/scripts/modules/core/src/function/Functions.tsx

// import { Application } from 'core/application/application.model';
// import { CloudProviderRegistry } from 'core/cloudProvider';
// import { IFunctions, IServerGroup } from 'core/domain';
=======
import { Application } from 'core/application/application.model';
// import { CloudProviderRegistry } from 'core/cloudProvider';
// import { IFunctions, IServerGroup } from 'core/domain';
import { CreateFunctionButton } from 'core/function/CreateFunctionButton';
<<<<<<< HEAD
>>>>>>> 043212291... Create Function Modal added. Needs to be modified with Lambda creation fileds.:app/scripts/modules/core/src/function/Function.tsx

=======
import { FunctionImport } from './functionImport';
>>>>>>> 5d42a452a... add list functions button and function lists
// import { HealthCounts } from 'core/healthCounts/HealthCounts';
// import { EntityNotifications } from 'core/entityTag/notifications/EntityNotifications';
=======
import { UISref, UISrefActive } from '@uirouter/react';

import { Application } from 'core/application/application.model';
import { IFunction } from 'core/domain';
>>>>>>> 980813ed4... For collaboration with Cynthia

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
