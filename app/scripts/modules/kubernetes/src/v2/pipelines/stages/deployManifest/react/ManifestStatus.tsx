import * as React from 'react';
import { IManifest } from '@spinnaker/core';
import { DeployManifestStatusPills } from './DeployStatusPills';
import { ManifestYaml } from './ManifestYaml';
import { ManifestDetailsLink } from './ManifestDetailsLink';
import { ManifestEvents } from './ManifestEvents';

import './ManifestStatus.less';

export interface IManifestStatusProps {
  manifest: IManifest;
  stage: any;
}

export class ManifestStatus extends React.Component<IManifestStatusProps> {
  public render() {
    const { manifest, stage } = this.props;
    const { account } = stage.context;
    return [
      <dl className="manifest-status" key="manifest-status">
        <dt>{manifest.manifest.kind}</dt>
        <dd>
          {manifest.manifest.metadata.name}
          &nbsp;
          <DeployManifestStatusPills manifest={manifest} />
        </dd>
      </dl>,
      <div className="manifest-support-links" key="manifest-support-links">
        <ManifestYaml manifest={manifest} linkName="YAML" />
        <ManifestDetailsLink linkName="Details" manifest={manifest} accountId={account} />
      </div>,
      <div className="manifest-events pad-left" key="manifest-events">
        <ManifestEvents manifest={manifest} />
      </div>,
    ];
  }
}
