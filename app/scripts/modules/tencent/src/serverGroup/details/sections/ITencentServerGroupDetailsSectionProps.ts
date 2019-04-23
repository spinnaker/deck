import { IServerGroupDetailsSectionProps } from '@spinnaker/core';

import { ITencentServerGroupView } from 'tencent/domain';

export interface ITencentServerGroupDetailsSectionProps extends IServerGroupDetailsSectionProps {
  serverGroup: ITencentServerGroupView;
}
