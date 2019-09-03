import * as React from 'react';
import { map, without } from 'lodash';
import { Modal } from 'react-bootstrap';
import { Form } from 'formik';

import { Application } from 'core/application';
import { IPipeline } from 'core/domain';
import { ModalClose } from 'core/modal';
import { PipelineConfigService } from 'core/pipeline';
import {
  FormikFormField,
  IModalComponentProps,
  IValidator,
  SpinFormik,
  TextInput,
  Validators,
} from 'core/presentation';

export interface IRenamePipelineModalProps extends IModalComponentProps {
  application: Application;
  pipeline: IPipeline;
}

interface IRenamePipelineCommand {
  name: string;
}

export function RenamePipelineModal(props: IRenamePipelineModalProps) {
  const { application, closeModal, dismissModal, pipeline } = props;
  const [errorMessage, setErrorMessage] = React.useState<string>(null);
  const [saveError, setSaveError] = React.useState<boolean>(false);
  const [saving, setSaving] = React.useState<boolean>(false);
  const existingNames = without(map(application.pipelineConfigs.data, 'name'), pipeline.name);
  const pipelineType = pipeline.strategy === true ? 'Strategy' : 'Pipeline';
  const initialValues: IRenamePipelineCommand = { name: pipeline.name };

  const validPipelineName = (): IValidator => {
    return (val: string) => {
      const message = `${pipelineType} cannot contain: \\ ? % #`;
      return val && !/^[^\\\^/^?^%^#]*$/i.test(val) && message;
    };
  };

  function renamePipeline(command: IRenamePipelineCommand) {
    setSaving(true);
    PipelineConfigService.renamePipeline(application.name, pipeline, pipeline.name, command.name).then(
      () => {
        application.pipelineConfigs.refresh();
        closeModal(command.name);
      },
      response => {
        setSaving(false);
        setSaveError(true);
        setErrorMessage(response.message || 'No message provided');
      },
    );
  }

  return (
    <>
      <SpinFormik<IRenamePipelineCommand>
        initialValues={initialValues}
        onSubmit={renamePipeline}
        render={formik => (
          <Form className="form-horizontal">
            <Modal key="modal" show={true} onHide={() => {}}>
              <ModalClose dismiss={dismissModal} />
              <Modal.Header>
                <h3>Rename Pipeline</h3>
              </Modal.Header>
              <Modal.Body>
                {saveError && (
                  <div className="alert alert-danger">
                    <p>Could not rename pipeline.</p>
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
                <FormikFormField
                  name="name"
                  label={`${pipelineType} Name`}
                  input={inputProps => <TextInput {...inputProps} className="form-control input-sm" />}
                  required={true}
                  validate={[
                    Validators.valueUnique(existingNames, `There is already a ${pipelineType} with that name.`),
                    validPipelineName(),
                  ]}
                />
              </Modal.Body>
              <Modal.Footer>
                <button className="btn btn-default" onClick={dismissModal} type="button">
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  disabled={!formik.isValid || !formik.dirty}
                  type="submit"
                  onClick={() => renamePipeline(formik.values)}
                >
                  <span className={saving ? 'fa fa-cog fa-spin' : 'far fa-check-circle'} />
                  Rename {pipelineType}
                </button>
              </Modal.Footer>
            </Modal>
          </Form>
        )}
      />
    </>
  );
}
