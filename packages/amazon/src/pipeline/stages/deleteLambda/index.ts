// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Registry } from '@spinnaker/core';
import { lambdaDeleteStage } from './LambdaDeleteStage';

export * from './LambdaDeleteStage';

Registry.pipeline.registerStage(lambdaDeleteStage);
