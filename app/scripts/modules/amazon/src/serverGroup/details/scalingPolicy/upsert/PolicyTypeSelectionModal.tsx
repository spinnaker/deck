import * as React from 'react';
import { Modal } from 'react-bootstrap';
import autoBindMethods from 'class-autobind-decorator';

export interface IPolicyTypeSelectionModalState {
  typeSelection: string;
}

export interface IPolicyTypeSelectionModalProps {
  showCallback: () => void;
  typeSelectedCallback: (type: string) => void;
}

@autoBindMethods
export class PolicyTypeSelectionModal extends React.Component<IPolicyTypeSelectionModalProps, IPolicyTypeSelectionModalState> {

  constructor(props: IPolicyTypeSelectionModalProps) {
    super(props);
    this.state = {
      typeSelection: null
    };
  }

  public close(): void {
    this.props.showCallback();
  }

  public selectType(e: React.MouseEvent<HTMLElement>): void {
    this.setState({typeSelection: e.currentTarget.id});
  }

  public confirmTypeSelection(): void {
    this.props.typeSelectedCallback(this.state.typeSelection);
  }

  public render() {
    const stepClass = this.state.typeSelection === 'step' ? 'card active' : 'card';
    const targetClass = this.state.typeSelection === 'targetTracking' ? 'card active' : 'card';
    return (
      <Modal show={true} onHide={this.close}>
        <Modal.Header closeButton={true}>
          <h3>Select a policy type</h3>
        </Modal.Header>
        <Modal.Body>
          <div className="card-choices">
            <div className={targetClass} onClick={this.selectType} id="targetTracking">
              <h3>Target Tracking</h3>
              <div>Continuously adjusts the size of the ASG to keep a specified metric at the target value</div>
            </div>
            <div className={stepClass} onClick={this.selectType} id="step">
              <h3>Step</h3>
              <div>Rule-based scaling, with the ability to define different scaling amounts depending on the magnitude of the alarm breach</div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button
            className="btn btn-default"
            onClick={this.close}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary"
            disabled={!this.state.typeSelection}
            onClick={this.confirmTypeSelection}
          >
            Next
          </button>
        </Modal.Footer>
      </Modal>
    );
  }
}
