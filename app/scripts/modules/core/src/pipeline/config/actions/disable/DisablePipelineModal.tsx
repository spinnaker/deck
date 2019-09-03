import * as React from 'react';
import { Modal } from 'react-bootstrap';

import { IPipeline } from 'core/domain';
import { ModalClose } from 'core/modal';
import { IModalComponentProps } from 'core/presentation';
import { PipelineConfigService } from 'core/pipeline';

export interface IDisablePipelineModalProps extends IModalComponentProps {
  pipeline: IPipeline;
}

export function DisablePipelineModal(props: IDisablePipelineModalProps) {
  const [errorMessage, setErrorMessage] = React.useState<string>(null);
  const [saveError, setSaveError] = React.useState<boolean>(false);
  const { closeModal, dismissModal, pipeline } = props;

  function disablePipeline() {
    PipelineConfigService.savePipeline({ ...pipeline, disabled: true }).then(
      () => closeModal(),
      response => {
        setSaveError(true);
        setErrorMessage(response.message || 'No message provided');
      },
    );
  }

  return (
    <>
      <Modal key="modal" show={true} onHide={() => {}}>
        <ModalClose dismiss={dismissModal} />
        <Modal.Header>
          <h3>Really Disable Pipeline?</h3>
        </Modal.Header>
        <Modal.Body>
          {saveError && (
            <div className="alert alert-danger">
              <p>Could not disable pipeline.</p>
              <p>
                <b>Reason: </b>
                {errorMessage}
              </p>
              <p>
                <a
                  className="btn btn-link"
                  onClick={e => {
                    e.preventDefault();
                    setSaveError(false);
                  }}
                >
                  [dismiss]
                </a>
              </p>
            </div>
          )}
          <form role="form" name="form" className="form-horizontal">
            <div className="form-group">
              <div className="col-md-12">
                <p>Are you sure you want to disable {pipeline.name}?</p>
                <p>
                  This will prevent any triggers from firing, and will also prevent users from running the pipeline
                  manually.
                </p>
              </div>
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <button className="btn btn-default" onClick={dismissModal} type="button">
            Cancel
          </button>
          <button className="btn btn-primary" onClick={disablePipeline} type="button">
            Disable pipeline
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
