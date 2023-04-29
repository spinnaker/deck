// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Registry } from '@spinnaker/core';
import { lambdaRouteStage } from './LambdaRouteStage';

export * from './LambdaRouteStage';

Registry.pipeline.registerStage(lambdaRouteStage);
