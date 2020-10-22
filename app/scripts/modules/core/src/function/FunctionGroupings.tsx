import React from 'react';
import { Application } from 'core';
import { IFunctionGroup } from 'core/domain';
import { FunctionPod } from './FunctionPod';

export interface IFunctionGroupingsProps {
  app: Application;
  groups: IFunctionGroup[];
}
export class FunctionGroupings extends React.Component<IFunctionGroupingsProps> {
  constructor(props: IFunctionGroupingsProps) {
    super(props);
  }
  public render() {
    return (
      <div>
        {this.props.groups.map((group) => (
          <div key={group.heading} className="rollup">
            {group.subgroups &&
              group.subgroups.map((subgroup) => (
                <FunctionPod
                  key={subgroup.heading}
                  grouping={subgroup}
                  application={this.props.app}
                  parentHeading={group.heading}
                />
              ))}
          </div>
        ))}
      </div>
    );
  }
}
