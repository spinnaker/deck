import * as React from 'react';
import { Button, Modal } from 'react-bootstrap';

import { IFunctionModalProps, ModalClose, ReactModal, noop } from '@spinnaker/core';
import { IAmazonFunctionConfig, FunctionTypes } from './FunctionTypes';

export class FunctionChoiceModal extends React.Component<IFunctionModalProps> {
  public static defaultProps: Partial<IFunctionModalProps> = {
    closeModal: noop,
    dismissModal: noop,
  };

  public static show(props: IFunctionModalProps): Promise<void> {
    return ReactModal.show(FunctionChoiceModal, {
      ...props,
      className: 'create-pipeline-modal-overflow-visible',
    });
  }

  constructor(props: IFunctionModalProps) {
    super(props);
    this.state = {
      choices: FunctionTypes,
      selectedChoice: FunctionTypes[0],
    };
  }

  public choiceSelected(choice: IAmazonFunctionConfig): void {
    this.setState({ selectedChoice: choice });
  }

  private choose = (): void => {
    const { children, ...functionProps } = this.props;
    this.close();
    this.state.selectedChoice.component
      .show(functionProps)
      .then(funct => {
        this.props.closeModal(funct);
      })
      .catch(() => {});
  };

  public close = (reason?: any): void => {
    this.props.dismissModal(reason);
  };

  public render() {
    const { choices, selectedChoice } = this.state;

    return (
      <>
        <ModalClose dismiss={this.close} />
        <Modal.Header>
          <Modal.Title>Select your Cloud Provider</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="modal-body">
            <div className="card-choices">
              {choices.map(choice => (
                <div
                  key={choice.type}
                  className={`card ${selectedChoice === choice ? 'active' : ''}`}
                  onClick={() => this.choiceSelected(choice)}
                >
                  <h3 className="function-label">{choice.label}</h3>
                  <h3>({choice.sublabel})</h3>
                  <div>{choice.description}</div>
                </div>
              ))}
            </div>
            <div className="function-description" />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.choose}>
            Configure Function <span className="glyphicon glyphicon-chevron-right" />
          </Button>
        </Modal.Footer>
      </>
    );
  }
}
