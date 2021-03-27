import { Cache, CacheFactory } from 'cachefactory';

export class PinExecutionIdCacheInternal {
  private cacheFactory = new CacheFactory();
  private cacheId = 'pinExecutionIDCache';
  private stateCache: Cache;

  constructor() {
    try {
      this.cacheFactory.createCache(this.cacheId, {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        deleteOnExpire: 'aggressive',
        storageMode: 'localStorage', // TODO: Can be a shared one?
      });
    } catch (e) {
      // trying to create a cache multiple times throws and Error
    }

    this.stateCache = this.cacheFactory.get(this.cacheId);
  }

  public isSet(pipelineId: string): boolean {
    return !!pipelineId && this.stateCache.get(pipelineId) !== undefined;
  }

  public isPinned(pipelineId: string, executionId: string): boolean {
    return !!pipelineId && this.stateCache.get(pipelineId) === executionId;
  }

  public pin(pipelineId: string, executionId: string) {
    if (pipelineId) {
      this.stateCache.put(pipelineId, executionId);
    }
  }

  public unpin(pipelineId: string) {
    if (pipelineId) {
      this.stateCache.put(pipelineId, "");
    }
  }

  public getPinnedExecution(pipelineId: string) {
    if (this.isSet(pipelineId)) {
      return this.stateCache.get(pipelineId);
    } else {
      return "";
    }
  }
}

export const PinExecutionIdCache = new PinExecutionIdCacheInternal();
