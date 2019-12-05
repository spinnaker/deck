import * as React from 'react';
import { has, get } from 'lodash';

import {
  AccountTag,
  CollapsibleSection,
  IEntityTags,
  IViewChangesConfig,
  NgReact,
  SETTINGS,
  timestamp,
} from '@spinnaker/core';

import { ITencentServerGroupView } from 'tencent/domain';
import { VpcTag } from 'tencent/vpc/VpcTag';

import { ITencentServerGroupDetailsSectionProps } from './ITencentServerGroupDetailsSectionProps';

export interface ITencentInfoDetailsSectionState {
  changeConfig: IViewChangesConfig;
}

export class TencentInfoDetailsSection extends React.Component<
  ITencentServerGroupDetailsSectionProps,
  ITencentInfoDetailsSectionState
> {
  constructor(props: ITencentServerGroupDetailsSectionProps) {
    super(props);
    this.state = { changeConfig: this.getChangeConfig(props.serverGroup) };
  }

  private getChangeConfig(serverGroup: ITencentServerGroupView): IViewChangesConfig {
    const changeConfig: IViewChangesConfig = {
      metadata: get(serverGroup.entityTags, 'creationMetadata'),
    };
    if (has(serverGroup, 'buildInfo.jenkins')) {
      changeConfig.buildInfo = {
        ancestor: undefined,
        jenkins: serverGroup.buildInfo.jenkins,
        target: undefined,
      };
    }

    return changeConfig;
  }

  public componentWillReceiveProps(nextProps: ITencentServerGroupDetailsSectionProps) {
    this.setState({ changeConfig: this.getChangeConfig(nextProps.serverGroup) });
  }

  public render(): JSX.Element {
    const { serverGroup } = this.props;
    const { changeConfig } = this.state;
    const { EntitySource, ViewChangesLink } = NgReact;

    const showEntityTags = SETTINGS.feature && SETTINGS.feature.entityTags;
    const entityTags = serverGroup.entityTags || ({} as IEntityTags);

    return (
      <CollapsibleSection heading="Server Group Information" defaultExpanded={true}>
        <dl className="dl-horizontal dl-flex">
          <dt>Created</dt>
          <dd>{timestamp(serverGroup.createdTime)}</dd>
          {showEntityTags && <EntitySource metadata={entityTags.creationMetadata} />}
          {showEntityTags && (
            <ViewChangesLink
              changeConfig={changeConfig}
              linkText="view changes"
              nameItem={serverGroup}
              viewType="description"
            />
          )}
          <dt>In</dt>
          <dd>
            <AccountTag account={serverGroup.account} />
            {serverGroup.region}
          </dd>
          <dt>VPC</dt>
          <dd>
            <VpcTag vpcId={serverGroup.asg.vpcId} />
          </dd>
          {serverGroup.asg.subnetIdSet && serverGroup.asg.subnetIdSet.length && <dt>Subnet</dt>}
          {serverGroup.asg.subnetIdSet && serverGroup.asg.subnetIdSet.length && (
            <dd>
              <ul>
                {serverGroup.asg.subnetIdSet.map(id => (
                  <li key={id}>{id}</li>
                ))}
              </ul>
            </dd>
          )}
          {serverGroup.asg && serverGroup.asg.zoneSet.length ? <dt>Zones</dt> : null}
          {serverGroup.asg && serverGroup.asg.zoneSet.length ? (
            <dd>
              <ul>
                {serverGroup.asg.zoneSet.map(zone => (
                  <li key={zone}>{zone}</li>
                ))}
              </ul>
            </dd>
          ) : null}
        </dl>
      </CollapsibleSection>
    );
  }
}
