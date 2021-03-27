import { module } from 'angular';

import { PinExecutionIdCache } from "core/cache";

export class PinExecutionIdModel {

  // public constructor() {
  //
  // }

  public isPinned(pipelineId: string, executionId: string): boolean {
    return PinExecutionIdCache.isSet(pipelineId) &&
      PinExecutionIdCache.isPinned(pipelineId, executionId)
  }

  public pinExecution(pipelineId: string, executionId: string): void {
    PinExecutionIdCache.pin(pipelineId, executionId)
  }

  public unpinExecution(pipelineId: string): void {
    PinExecutionIdCache.unpin(pipelineId)
  }

  public getPinnedExecution(pipelineId: string): string {
    return PinExecutionIdCache.getPinnedExecution(pipelineId)
  }
}

export const PIN_EXECUTION_ID_MODEL = 'spinnaker.core.insight.pinExecutionId.model';
module(PIN_EXECUTION_ID_MODEL, []).service('pinExecutionIdModel', PinExecutionIdModel);

