import React from 'react';

import { BuildServiceType } from 'core/ci/igor.service';
import {
  BaseBuildTrigger,
  IBaseBuildTriggerConfigProps,
} from 'core/pipeline/config/triggers/baseBuild/BaseBuildTrigger';

export class JenkinsTrigger extends React.Component<IBaseBuildTriggerConfigProps> {
  public render() {
    return <BaseBuildTrigger {...this.props} buildTriggerType={BuildServiceType.Jenkins} />;
  }
}
