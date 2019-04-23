import * as React from 'react';

import { Application, ModalInjector } from '@spinnaker/core';

import { TencentReactInjector } from 'tencent/reactShims';
import { ITencentServerGroupView } from 'tencent/domain';

export interface ICreateScalingPolicyButtonProps {
  application: Application;
  serverGroup: ITencentServerGroupView;
}

export interface ICreateScalingPolicyButtonState {
  showSelection: boolean;
  showModal: boolean;
  typeSelection: string;
}

export class CreateScalingPolicyButton extends React.Component<
  ICreateScalingPolicyButtonProps,
  ICreateScalingPolicyButtonState
> {
  constructor(props: ICreateScalingPolicyButtonProps) {
    super(props);
    this.state = {
      showSelection: false,
      showModal: false,
      typeSelection: null,
    };
  }

  public handleClick = (): void => {
    this.setState({ showSelection: true });
  };

  public createStepPolicy(): void {
    const { serverGroup, application } = this.props;

    ModalInjector.modalService
      .open({
        templateUrl: require('./upsert/upsertScalingPolicy.modal.html'),
        controller: 'tencentUpsertScalingPolicyCtrl',
        controllerAs: 'ctrl',
        size: 'lg',
        resolve: {
          policy: () => TencentReactInjector.tencentServerGroupTransformer.constructNewStepScalingPolicyTemplate(),
          serverGroup: () => serverGroup,
          application: () => application,
        },
      })
      .result.catch(() => {});
  }

  public typeSelected = (typeSelection: string): void => {
    this.setState({ typeSelection, showSelection: false, showModal: true });
    if (typeSelection === 'step') {
      this.createStepPolicy();
    }
  };

  public showModalCallback = (): void => {
    this.setState({ showSelection: false, showModal: false, typeSelection: null });
  };

  public render() {
    // const { min, max } = this.props.serverGroup.capacity;
    return (
      <div>
        <a
          className="clickable"
          onClick={() => {
            this.typeSelected('step');
          }}
        >
          Create new scaling policy
        </a>
      </div>
    );
  }
}
