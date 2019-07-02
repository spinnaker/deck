import * as React from 'react';

import { ReactModal, Application, Overridable } from '@spinnaker/core';
import { ITitusServerGroup } from 'titus/domain';
import { ITitusResizeServerGroupModalProps, TitusResizeServerGroupModal } from './resize/TitusResizeServerGroupModal';

interface ICapacityDetailsSectionProps {
  app: Application;
  serverGroup: ITitusServerGroup;
}

const SimpleMinMaxDesired = ({ serverGroup }: ICapacityDetailsSectionProps) => (
  <>
    <dt>Min/Max</dt>
    <dd>{serverGroup.capacity.desired}</dd>
    <dt>Current</dt>
    <dd>{serverGroup.instances.length}</dd>
  </>
);

const AdvancedMinMaxDesired = ({ serverGroup }: ICapacityDetailsSectionProps) => (
  <>
    <dt>Min</dt>
    <dd>{serverGroup.capacity.min}</dd>
    <dt>Desired</dt>
    <dd>{serverGroup.capacity.desired}</dd>
    <dt>Max</dt>
    <dd>{serverGroup.capacity.max}</dd>
    <dt>Current</dt>
    <dd>{serverGroup.instances.length}</dd>
  </>
);

const CapacityGroup = ({ serverGroup }: ICapacityDetailsSectionProps) => (
  <>
    <dt>Cap. Group</dt>
    <dd>{serverGroup.capacityGroup}</dd>
  </>
);

@Overridable('titus.serverGroup.CapacityDetailsSection')
export class CapacityDetailsSection extends React.Component<ICapacityDetailsSectionProps> {
  public render(): JSX.Element {
    const { serverGroup, app: application } = this.props;
    const isSimpleMode = serverGroup.capacity.min === serverGroup.capacity.max;
    // const hasNimbleCapacity = !!nimbleCapacity;
    const resizeServerGroup = () =>
      ReactModal.show<ITitusResizeServerGroupModalProps>(TitusResizeServerGroupModal, { serverGroup, application });

    return (
      <>
        <dl className="dl-horizontal dl-flex">
          {isSimpleMode ? <SimpleMinMaxDesired {...this.props} /> : <AdvancedMinMaxDesired {...this.props} />}
          {serverGroup.capacityGroup && <CapacityGroup {...this.props} />}
        </dl>

        <div>
          <a className="clickable" onClick={resizeServerGroup}>
            Resize Server Group
          </a>
        </div>
      </>
    );
  }
}
