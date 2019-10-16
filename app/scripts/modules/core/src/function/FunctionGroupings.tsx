import * as React from 'react';
import { Application } from '@spinnaker/core';
import { IFunctionGroup } from 'core/domain';
import { FunctionPod } from './FunctionPod';

export interface IFunctionGroupingsProps {
  app: Application;
  groups: IFunctionGroup[];
}
export interface IFunctionGroupingsState {
  groups: IFunctionGroup[];
}
export class FunctionGroupings extends React.Component<IFunctionGroupingsProps, IFunctionGroupingsState> {
  constructor(props: IFunctionGroupingsProps) {
    super(props);

    const { groups } = props;
    this.state = {
      groups,
    };
  }
  public render() {
    return (
      <div>
        {this.state.groups.map(group => (
          <div key={group.heading} className="rollup">
            {group.subgroups &&
              group.subgroups.map(subgroup => (
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
