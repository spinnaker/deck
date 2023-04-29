// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Registry } from '@spinnaker/core';
import { lambdaUpdateCodeStage } from './LambdaUpdateCodeStage';

export * from './LambdaUpdateCodeStage';

Registry.pipeline.registerStage(lambdaUpdateCodeStage);
