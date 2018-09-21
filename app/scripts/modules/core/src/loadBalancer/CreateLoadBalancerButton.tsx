import * as React from 'react';

import { Application } from 'core/application';
import { CloudProviderRegistry } from 'core/cloudProvider';
import { ILoadBalancer } from 'core/domain';
import { ILoadBalancerUpsertCommand } from 'core/loadBalancer';
import { ModalInjector, ReactInjector } from 'core/reactShims';
import { IModalComponentProps, Tooltip } from 'core/presentation';

export interface ILoadBalancerModalProps extends IModalComponentProps {
  className?: string;
  dialogClassName?: string;
  app: Application;
  forPipelineConfig?: boolean;
  loadBalancer: ILoadBalancer;
  closeModal?(loadBalancerCommand: ILoadBalancerUpsertCommand): void; // provided by ReactModal
  dismissModal?(rejectReason?: any): void; // provided by ReactModal
}

export interface ICreateLoadBalancerButtonProps {
  app: Application;
}

export class CreateLoadBalancerButton extends React.Component<ICreateLoadBalancerButtonProps> {
  constructor(props: ICreateLoadBalancerButtonProps) {
    super(props);
  }

  private createLoadBalancer = (): void => {
    const { providerSelectionService, skinSelectionService } = ReactInjector;
    const { app } = this.props;
    providerSelectionService.selectProvider(app, 'loadBalancer').then(selectedProvider => {
      skinSelectionService.selectSkin(selectedProvider).then(selectedSkin => {
        const provider = CloudProviderRegistry.getValue(selectedProvider, 'loadBalancer', selectedSkin);

        if (provider.CreateLoadBalancerModal) {
          provider.CreateLoadBalancerModal.show({
            app: app,
            application: app,
            forPipelineConfig: false,
            loadBalancer: null,
            isNew: true,
          });
        } else {
          // angular
          ModalInjector.modalService
            .open({
              templateUrl: provider.createLoadBalancerTemplateUrl,
              controller: `${provider.createLoadBalancerController} as ctrl`,
              size: 'lg',
              resolve: {
                application: () => this.props.app,
                loadBalancer: (): ILoadBalancer => null,
                isNew: () => true,
                forPipelineConfig: () => false,
              },
            })
            .result.catch(() => {});
        }
      });
    });
  };

  public render() {
    return (
      <div>
        <button className="btn btn-sm btn-default" onClick={this.createLoadBalancer}>
          <span className="glyphicon glyphicon-plus-sign visible-lg-inline" />
          <Tooltip value="Create Load Balancer">
            <span className="glyphicon glyphicon-plus-sign visible-md-inline visible-sm-inline" />
          </Tooltip>
          <span className="visible-lg-inline"> Create Load Balancer</span>
        </button>
      </div>
    );
  }
}
