import * as React from 'react';

import { Application } from 'core/application';
import { CloudProviderRegistry, ProviderSelectionService } from 'core/cloudProvider';
import { IFunction } from 'core/domain';
import { IFunctionUpsertCommand } from 'core/function';
import { ModalInjector, ReactInjector } from 'core/reactShims';
import { IModalComponentProps, Tooltip } from 'core/presentation';
import { FunctionChoiceModal } from './FunctionChoiceModal';

export interface IFunctionModalProps extends IModalComponentProps {
  className?: string;
  dialogClassName?: string;
  app: Application;
  forPipelineConfig?: boolean;
  functionDef: IFunction;
  command?: IFunctionUpsertCommand; // optional, when ejecting from a wizard
  closeModal?(functionCommand: IFunctionUpsertCommand): void; // provided by ReactModal
  dismissModal?(rejectReason?: any): void; // provided by ReactModal
}

export interface ICreateFunctionButtonProps {
  app: Application;
}

export class CreateFunctionButton extends React.Component<ICreateFunctionButtonProps> {
  constructor(props: ICreateFunctionButtonProps) {
    super(props);
  }

  private createFunction = (): void => {
    const { skinSelectionService } = ReactInjector;
    const { app } = this.props;

    ProviderSelectionService.selectProvider(app, 'function').then(selectedProvider => {
      skinSelectionService.selectSkin(selectedProvider).then(selectedSkin => {
        const provider = CloudProviderRegistry.getValue(selectedProvider, 'function', selectedSkin);
        if (provider.CreateFunctionModal) {
          provider.CreateFunctionModal.show({
            app: app,
            application: app,
            forPipelineConfig: false,
            function: null,
            isNew: true,
          });
        } else {
          // TODO
          // angular
          ModalInjector.modalService
            .open({
              templateUrl: provider.createFunctionTemplateUrl,
              controller: `${provider.createFunctionController} as ctrl`,
              size: 'lg',
              resolve: {
                application: () => this.props.app,
                function: (): IFunction => null,
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
        <button className="btn btn-sm btn-default" onClick={this.createFunction}>
          <span className="glyphicon glyphicon-plus-sign visible-lg-inline" />
          <Tooltip value="Create Function">
            <span className="glyphicon glyphicon-plus-sign visible-md-inline visible-sm-inline" />
          </Tooltip>
          <span className="visible-lg-inline"> Create Function </span>
        </button>
      </div>
    );
  }
}
