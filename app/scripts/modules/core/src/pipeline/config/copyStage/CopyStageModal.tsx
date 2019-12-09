import React from 'react';
import { Modal } from 'react-bootstrap';
import { Form } from 'formik';
import { IPromise } from 'angular';
import { flatten, isEmpty } from 'lodash';
import { Option } from 'react-select';

import { API } from 'core/api/ApiService';
import { Application } from 'core/application';
import { ApplicationReader } from 'core/application/service/ApplicationReader';
import { ModalClose } from 'core/modal';
import { IPipeline, IStage, IStrategy } from 'core/domain';
import {
  FormikFormField,
  IModalComponentProps,
  ReactSelectInput,
  SpinFormik,
  useData,
  useLatestPromise,
} from 'core/presentation';
import { ICopyStageCardProps, CopyStageCard } from './CopyStageCard';

import './copyStageModal.less';

export interface ICopyStageModalProps extends IModalComponentProps {
  application: Application;
  forStrategyConfig: boolean;
}

interface ICopyStageCommand {
  application: string;
  selectedStage: string;
}

export function CopyStageModal(props: ICopyStageModalProps) {
  const [application, setApplication] = React.useState<string>(props.application.name);
  const uncopiableStageTypes: Set<string> = new Set(['deploy']);
  const initialValues: ICopyStageCommand = { application: application, selectedStage: null };
  const { closeModal, dismissModal, forStrategyConfig } = props;

  const fetchApplications = useLatestPromise(() => ApplicationReader.listApplications(), []);
  const fetchStages = useData(() => getStagesForApplication(application), null, [application]);

  const error = fetchApplications.status === 'REJECTED' || fetchStages.status === 'REJECTED';

  function getStagesForApplication(applicationName: string): IPromise<ICopyStageCardProps[]> {
    const configType = forStrategyConfig ? 'strategyConfigs' : 'pipelineConfigs';

    return API.one('applications')
      .one(applicationName)
      .all(configType)
      .getList()
      .then((configs: Array<IPipeline | IStrategy>) => {
        const nestedStageWrappers = configs.map(config => {
          return (config.stages || [])
            .filter((stage: IStage) => !uncopiableStageTypes.has(stage.type))
            .map((stage: IStage) => {
              if (isStrategyConfig(config)) {
                return { strategy: config.name, stage };
              } else {
                return { pipeline: config.name, stage };
              }
            });
        });

        return flatten(nestedStageWrappers);
      });
  }

  function renderCopyStageCard(option: Option<string>) {
    const parsed = JSON.parse(option.value);
    return <CopyStageCard {...parsed} />;
  }

  function renderCopyStageValue(option: Option<string>) {
    const parsed = JSON.parse(option.value);
    return parsed.stage.name;
  }

  function isStrategyConfig(config: IPipeline | IStrategy): boolean {
    return 'strategy' in config;
  }

  function copyStage(command: ICopyStageCommand) {
    const parsed = JSON.parse(command.selectedStage);
    closeModal(parsed.stage);
  }

  return (
    <>
      <SpinFormik<ICopyStageCommand>
        initialValues={initialValues}
        onSubmit={copyStage}
        render={formik => (
          <Modal key="modal" show={true} onHide={() => {}}>
            <ModalClose dismiss={dismissModal} />
            <Modal.Header>
              <h3>Copy Stage</h3>
            </Modal.Header>
            <Modal.Body>
              <div className="copy-stage-modal-body">
                {error && (
                  <div className="alert alert-danger">
                    <p>Could not load stages.</p>
                  </div>
                )}
                <Form name="form" className="form-horizontal">
                  <FormikFormField
                    fastField={false}
                    name="application"
                    label="From Application"
                    input={inputProps => (
                      <ReactSelectInput
                        {...inputProps}
                        isLoading={fetchApplications.status === 'PENDING'}
                        clearable={false}
                        mode="VIRTUALIZED"
                        stringOptions={(fetchApplications.result || []).map(a => a.name)}
                        onChange={e => setApplication(e.target.value)}
                        value={application}
                      />
                    )}
                  />
                  <FormikFormField
                    fastField={false}
                    name="selectedStage"
                    label="Copy Stage"
                    required={true}
                    input={inputProps => (
                      <ReactSelectInput
                        {...inputProps}
                        isLoading={fetchStages.status === 'PENDING'}
                        clearable={false}
                        disabled={isEmpty(fetchStages.result)}
                        options={(fetchStages.result || []).map(s => ({
                          label: s.stage.name,
                          value: JSON.stringify(s),
                        }))}
                        optionRenderer={renderCopyStageCard}
                        valueRenderer={renderCopyStageValue}
                      />
                    )}
                  />
                  {fetchStages.status === 'RESOLVED' && isEmpty(fetchStages.result) && (
                    <div className="col-md-offset-3 col-md-7 no-stages-message">
                      <p>This application has no {forStrategyConfig ? 'strategy' : 'pipeline'} stages.</p>
                    </div>
                  )}
                </Form>

                <div className="container-fluid">
                  <div className="row">
                    <div className="col-md-offset-3 col-md-7">
                      <div className="well">
                        <p className="small">
                          It is not possible to copy a deploy stage, and deploy stages will not be included in the list
                          above.
                        </p>
                        <br />
                        <p className="small">
                          All source stage fields, including artifact IDs, will be copied into the new stage. If this is
                          not desired behavior, create a new stage from scratch instead.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <button className="btn btn-default" onClick={dismissModal} type="button">
                Cancel
              </button>
              <button
                className="btn btn-primary"
                disabled={!formik.isValid || !formik.dirty}
                type="submit"
                onClick={() => copyStage(formik.values)}
              >
                <span className="far fa-check-circle" />
                <span> Copy Stage</span>
              </button>
            </Modal.Footer>
          </Modal>
        )}
      />
    </>
  );
}
