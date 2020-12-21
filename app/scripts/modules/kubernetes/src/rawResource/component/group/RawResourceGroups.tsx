import React from 'react';
import { RawResourceGroup } from './RawResouceGroup';
import { RawResource } from './RawResource';
import { RawResourceUtils } from '../RawResourceUtils';

interface IRawResourceGroupsProps {
  resources: IApiKubernetesResource[];
  groupBy: string;
}

interface IRawResourceGroupsState {}

export class RawResourceGroups extends React.Component<IRawResourceGroupsProps, IRawResourceGroupsState> {
  constructor(props: IRawResourceGroupsProps) {
    super(props);
  }

  private buildGroupByModel(resources: IApiKubernetesResource[]) {
    const values = resources.map((r: Record<string, any>) => String(r[this.props.groupBy]));
    return Object.assign(
      {},
      ...values.map((value) => ({
        [value]: resources.filter((r: Record<string, any>) => String(r[this.props.groupBy]) === value),
      })),
    ) as Record<string, IApiKubernetesResource[]>;
  }

  private groupTitle(title: string): string {
    if (this.props.groupBy == 'namespace') {
      return RawResourceUtils.namespaceDisplayName(title);
    }
    return title;
  }

  public render() {
    const groups = this.buildGroupByModel(this.props.resources);
    return (
      <div className="raw-resource-groups">
        {...Object.entries(groups).map((entry) => {
          return entry[0] !== 'undefined' ? (
            <RawResourceGroup title={this.groupTitle(entry[0])}>
              {...entry[1].map((resource) => <RawResource resource={resource}></RawResource>)}
            </RawResourceGroup>
          ) : (
            <></>
          );
        })}
      </div>
    );
  }
}
