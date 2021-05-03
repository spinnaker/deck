import classNames from 'classnames';
import React from 'react';
import { Option } from 'react-select';

import {
  FormikFormField,
  HelpField,
  IFormikStageConfigInjectedProps,
  IFormInputProps,
  MapEditorInput,
  NumberInput,
  ReactSelectInput,
  TetheredCreatable,
  TextInput,
} from '@spinnaker/core';

import { BasicSettingsForm, ExecutionRoleForm, LambdaAtEdgeForm, NetworkForm, TriggerEventsForm } from '.';

export function AwsLambdaFunctionStageForm(props: IFormikStageConfigInjectedProps) {
  const { values, errors } = props.formik;

  const className = classNames({
    well: true,
    'alert-danger': !!errors.functionName,
    'alert-info': !errors.functionName,
  });

  const onLayerChange = (o: Option, field: any) => {
    props.formik.setFieldValue(
      field,
      o.map((layer: any) => layer.value),
    );
  };

  return (
    <div className="form-horizontal">
      <div className={className}>
        <strong>Your function will be named: </strong>
        <HelpField id="aws.function.name" />
        <span>{values.functionName ? values.functionName : props.application.name}</span>
        <FormikFormField name="functionName" input={(): any => null} />
      </div>
      <h4>Basic Settings</h4>
      <BasicSettingsForm {...props} />
      <h4> Execution Role </h4>
      <ExecutionRoleForm />
      <h4> Environment </h4>
      {values.enableLambdaAtEdge !== true ? (
        <>
          <FormikFormField
            name="envVariables"
            label="Env Variables"
            input={(props: IFormInputProps) => (
              <MapEditorInput {...props} allowEmptyValues={true} addButtonLabel="Add" />
            )}
          />
          <FormikFormField
            name="encryptionKMSKeyArn"
            label="Key ARN"
            help={<HelpField id="aws.function.kmsKeyArn" />}
            input={(props: IFormInputProps) => <TextInput {...props} />}
          />
        </>
      ) : (
        <div className="horizontal center">Environment variables not available with Lambda@Edge functions.</div>
      )}
      <h4> Tags </h4>
      <FormikFormField
        name="tags"
        input={(props: IFormInputProps) => <MapEditorInput {...props} allowEmptyValues={false} addButtonLabel="Add" />}
      />
      <h4> Settings </h4>
      <FormikFormField
        name="description"
        label="Description"
        input={(props: IFormInputProps) => <TextInput {...props} />}
      />
      <FormikFormField
        name="layers"
        label="Layer ARNs"
        help={
          <HelpField content="The resource ARNs for Lambda layer. Input the entire ARN and select `Create option TRIGGER-ARN-INPUT` to add the ARN." />
        }
        input={(inputProps: IFormInputProps) => (
          <TetheredCreatable
            {...inputProps}
            multi={true}
            placeholder={'Layer ARN...'}
            onChange={(e: Option) => {
              onLayerChange(e, 'layers');
            }}
            value={values.layers ? values.layers.map((layer: string) => ({ value: layer, label: layer })) : []}
          />
        )}
      />
      <FormikFormField
        name="reservedConcurrentExecutions"
        label="Reserved Concurrency"
        help={
          <HelpField content="The total number of current executions of your Lambda function that can be instantiated at any time." />
        }
        input={(props: IFormInputProps) => <NumberInput {...props} max={3000} />}
      />
      <FormikFormField
        name="memorySize"
        label="Memory (MB)"
        help={<HelpField id="aws.functionBasicSettings.memorySize" />}
        input={(props: IFormInputProps) => (
          <NumberInput {...props} min={128} max={values.enableLambdaAtEdge === true ? 128 : 3008} />
        )}
      />
      <FormikFormField
        name="timeout"
        label="Timeout (seconds)"
        help={<HelpField id="aws.functionBasicSettings.timeout" />}
        input={(props: IFormInputProps) => (
          <NumberInput {...props} min={1} max={values.enableLambdaAtEdge === true ? 5 : 900} />
        )}
      />
      <LambdaAtEdgeForm {...props} />
      <h4> Network </h4>
      {values.enableLambdaAtEdge !== true ? (
        <NetworkForm {...props} />
      ) : (
        <div className="horizontal center">VPC configuration not available with Lambda@Edge functions.</div>
      )}
      <h4> Event Triggers </h4>
      <TriggerEventsForm {...props} />
      <h4> Debugging and Error Handling </h4>
      Dead Letter Config
      <FormikFormField
        name="deadLetterConfig.targetArn"
        label="Target ARN"
        help={<HelpField id="aws.function.deadletterqueue" />}
        input={(props: IFormInputProps) => <TextInput {...props} />}
      />
      X-Ray Tracing
      <FormikFormField
        name="tracingConfig.mode"
        label="Mode"
        help={<HelpField id="aws.function.tracingConfig.mode" />}
        input={(props: IFormInputProps) => (
          <ReactSelectInput {...props} stringOptions={['Active', 'PassThrough']} clearable={true} />
        )}
      />
    </div>
  );
}
