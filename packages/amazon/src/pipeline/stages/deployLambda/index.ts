// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Registry } from '@spinnaker/core';
import { lambdaDeploymentStage } from './config/LambdaDeploymentStage';

export * from './config/LambdaDeploymentStage';

Registry.pipeline.registerStage(lambdaDeploymentStage);
