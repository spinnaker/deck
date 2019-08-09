import * as React from 'react';
import { FormikProps } from 'formik';

import { ApplicationReader } from 'core/application';
import { IPipelineTrigger } from 'core/domain';
import { PipelineConfigService } from 'core/pipeline';
import { ChecklistInput, FormikFormField, ReactSelectInput, useLatestPromise } from 'core/presentation';

export interface IPipelineTriggerConfigProps {
  formik: FormikProps<IPipelineTrigger>;
  pipelineId: string;
}

const statusOptions = ['successful', 'failed', 'canceled'];

export function PipelineTrigger(pipelineTriggerProps: IPipelineTriggerConfigProps) {
  const { formik, pipelineId } = pipelineTriggerProps;
  const trigger = formik.values;
  const { application } = trigger;

  const fetchApps = useLatestPromise(() => ApplicationReader.listApplications(), []);

  const appsLoaded = fetchApps.status === 'RESOLVED';
  const appsLoading = fetchApps.status === 'PENDING';
  const applications = React.useMemo(() => {
    return appsLoaded ? fetchApps.result.map(app => app.name).sort() : [];
  }, [appsLoaded, fetchApps.result]);

  const fetchPipelines = useLatestPromise(() => {
    return application ? PipelineConfigService.getPipelinesForApplication(application) : null;
  }, [application]);

  const pipelinesLoaded = fetchPipelines.status === 'RESOLVED';
  const pipelinesLoading = fetchPipelines.status === 'PENDING';
  const pipelines = React.useMemo(() => {
    return pipelinesLoaded ? fetchPipelines.result.filter(p => p.id !== pipelineId) : [];
  }, [pipelinesLoaded, pipelineId, fetchPipelines.result]);

  React.useEffect(() => {
    if (pipelinesLoaded && !pipelines.find(p => p.id === trigger.pipeline)) {
      formik.setFieldValue('pipeline', null);
    }
  }, [pipelinesLoaded, trigger.pipeline, pipelines]);

  return (
    <>
      <FormikFormField
        name="application"
        label="Application"
        fastField={false}
        required={true}
        input={props => (
          <ReactSelectInput
            {...props}
            disabled={!appsLoaded}
            isLoading={appsLoading}
            mode="VIRTUALIZED"
            stringOptions={applications}
            placeholder="None"
          />
        )}
      />

      <FormikFormField
        name="pipeline"
        label="Pipeline"
        fastField={false}
        required={true}
        input={props => (
          <ReactSelectInput
            {...props}
            disabled={!application || !pipelinesLoaded}
            isLoading={pipelinesLoading}
            mode="VIRTUALIZED"
            options={pipelines.map(p => ({ label: p.name, value: p.id }))}
            placeholder="Select a pipeline..."
          />
        )}
      />

      <FormikFormField
        name="status"
        label="Pipeline Status"
        required={true}
        input={props => <ChecklistInput {...props} stringOptions={statusOptions} inline={true} />}
      />
    </>
  );
}
