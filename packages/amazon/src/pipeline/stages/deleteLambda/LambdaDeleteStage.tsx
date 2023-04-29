// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

import type { IExecutionDetailsSectionProps, IFormikStageConfigInjectedProps, IStage, IStageConfigProps, IStageTypeConfig} from '@spinnaker/core';
import { ExecutionDetailsSection, ExecutionDetailsTasks, FormikStageConfig, FormValidator, HelpContentsRegistry, StageFailureMessage } from '@spinnaker/core';

import { DeleteLambdaFunctionStageForm } from './DeleteLambdaFunctionStageForm';

import './LambdaDeleteStage.less';

export function DeleteLambdaExecutionDetails(props: IExecutionDetailsSectionProps) {
  const { stage, name, current } = props;
  return (
    <ExecutionDetailsSection name={name} current={current}>
      <StageFailureMessage stage={stage} message={stage.outputs.failureMessage} />
      <div>
        <p> <b> Status: </b> {stage.outputs.deleteTask === "done" ? "COMPLETE" : stage.outputs.deleteTask } </p>
        <p> <b> Deleted Version: </b> {stage.outputs['deleteTask:deleteVersion'] ? stage.outputs['deleteTask:deleteVersion'] : "N/A"} </p>
      </div>
    </ExecutionDetailsSection>
  );
}

/*
  IStageConfigProps defines properties passed to all Spinnaker Stages.
  See IStageConfigProps.ts (https://github.com/spinnaker/deck/blob/master/app/scripts/modules/core/src/pipeline/config/stages/common/IStageConfigProps.ts) for a complete list of properties.
  Pass a JSON object to the `updateStageField` method to add the `account` to the Stage.

  This method returns JSX (https://reactjs.org/docs/introducing-jsx.html) that gets displayed in the Spinnaker UI.
 */
function DeleteLambdaConfig(props: IStageConfigProps) {
  return (
    <div className="DeleteLambdaStageConfig">
      <FormikStageConfig
        {...props}
        validate={validate}
        onChange={props.updateStage}
        render={(props: IFormikStageConfigInjectedProps) => <DeleteLambdaFunctionStageForm {...props} />}
      />
    </div>
  );
}

/*
  This is a contrived example of how to use an `initialize` function to hook into arbitrary Deck services.
  This `initialize` function provides the help field text for the `LambdaDeploymentConfig` stage form defined above.

  You can hook into any service exported by the `@spinnaker/core` NPM module, e.g.:
   - CloudProviderRegistry
   - DeploymentStrategyRegistry

  When you use a registry, you are diving into Deck's implementation to add functionality.
  These registries and their methods may change without warning.
*/
export const initialize = () => {
  HelpContentsRegistry.register('aws.lambdaDeploymentStage.lambda', 'Lambda Name');
};

function validate(stageConfig: IStage) {
  const validator = new FormValidator(stageConfig);
  validator
    .field('account', 'Account Name')
    .required()

  validator
    .field('region', 'Region')
    .required()

  validator
    .field('functionName', 'Lambda Function Name')
    .required()

  validator
   .field('version', 'Lambda Function Version')
   .required()

  return validator.validateForm();
}

export namespace DeleteLambdaExecutionDetails {
  export const title = 'Delete Lambda Stage';
}

/*
  Define Spinnaker Stages with IStageTypeConfig.
  Required options: https://github.com/spinnaker/deck/master/app/scripts/modules/core/src/domain/IStageTypeConfig.ts
  - label -> The name of the Stage
  - description -> Long form that describes what the Stage actually does
  - key -> A unique name for the Stage in the UI; ties to Orca backend
  - component -> The rendered React component
  - validateFn -> A validation function for the stage config form.
 */
export const lambdaDeleteStage: IStageTypeConfig = {
  key: 'Aws.LambdaDeleteStage',
  label: `AWS Lambda Delete`,
  description: 'Delete an AWS Lambda Function',
  component: DeleteLambdaConfig, // stage config
  executionDetailsSections: [DeleteLambdaExecutionDetails, ExecutionDetailsTasks],
  validateFn: validate,
};
