import * as React from 'react';
import { Modal } from 'react-bootstrap';

import { IPipeline, IPipelineLock } from 'core/domain';
import { ModalClose } from 'core/modal';
import { CheckboxInput, FormField, IModalComponentProps, TextInput } from 'core/presentation';
import { HelpField } from 'core/help';
import { PipelineConfigService } from 'core/pipeline';

export interface ILockPipelineModalProps extends IModalComponentProps {
  pipeline: IPipeline;
}

export function LockPipelineModal(props: ILockPipelineModalProps) {
  const [errorMessage, setErrorMessage] = React.useState<string>(null);
  const [saveError, setSaveError] = React.useState<boolean>(false);
  const [allowUnlockUi, setAllowUnlockUi] = React.useState<boolean>(true);
  const [description, setDescription] = React.useState<string>('');
  const { closeModal, dismissModal, pipeline } = props;

  function lockPipeline() {
    const locked: IPipelineLock = {
      ui: true,
      allowUnlockUi,
      description,
    };
    const newPipeline = { ...pipeline, locked };
    PipelineConfigService.savePipeline(newPipeline).then(
      () => closeModal(newPipeline),
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
          <h3>Really Lock Pipeline?</h3>
        </Modal.Header>
        <Modal.Body>
          {saveError && (
            <div className="alert alert-danger">
              <p>Could not lock pipeline.</p>
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
                <p>Are you sure you want to lock {pipeline.name}?</p>
                <p>This will prevent any further modification to this pipeline made via the Spinnaker UI.</p>
              </div>
            </div>
            <FormField
              label="Unlock via UI"
              help={<HelpField id="pipeline.config.lock.allowUnlockUi" />}
              input={inputProps => <CheckboxInput {...inputProps} />}
              onChange={() => setAllowUnlockUi(!allowUnlockUi)}
              value={allowUnlockUi}
            />
            <FormField
              label="Description"
              help={<HelpField id="pipeline.config.lock.description" />}
              input={inputProps => (
                <TextInput {...inputProps} placeholder="This pipeline is locked and does not allow modification" />
              )}
              onChange={e => setDescription(e.target.value)}
              value={description}
            />
          </form>
        </Modal.Body>
        <Modal.Footer>
          <button className="btn btn-default" onClick={dismissModal} type="button">
            Cancel
          </button>
          <button className="btn btn-primary" onClick={lockPipeline} type="button">
            Lock pipeline
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
