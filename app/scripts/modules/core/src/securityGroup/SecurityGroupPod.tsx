import * as React from 'react';
import { AccountTag } from 'core/account';
import { ISecurityGroupGroup } from 'core/domain';
import { ManagedResourceStatusIndicator } from 'core/managed';
import { Application } from 'core/application';
import { SecurityGroup } from './SecurityGroup';

interface ISecurityGroupPodProps {
  grouping: ISecurityGroupGroup;
  application: Application;
  parentHeading: string;
}

export const SecurityGroupPod = ({ grouping, application, parentHeading }: ISecurityGroupPodProps) => (
  <div className="row rollup-entry sub-group security-group-pod">
    <div className="rollup-summary sticky-header">
      <div className="rollup-title-cell">
        <div className="heading-tag">
          <AccountTag account={parentHeading} />
        </div>
        <div className="pod-center horizontal space-between flex-1 no-right-padding">
          <div>
            <span className="glyphicon glyphicon-transfer sp-padding-xs-right" />
            {grouping.heading}
          </div>
          {grouping.isManaged && (
            <ManagedResourceStatusIndicator
              shape="square"
              resourceSummary={grouping.managedResourceSummary}
              application={application}
            />
          )}
        </div>
      </div>
    </div>
    <div className="rollup-details">
      {grouping.subgroups.map((subgroup) => (
        <div className="pod-subgroup" key={subgroup.heading}>
          <SecurityGroup
            application={application}
            securityGroup={subgroup.securityGroup}
            parentGrouping={grouping}
            heading={subgroup.heading}
          />
        </div>
      ))}
    </div>
  </div>
);
