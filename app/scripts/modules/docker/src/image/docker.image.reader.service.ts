import { module } from 'angular';

import {
  Api,
  API_SERVICE,
  IFindImageParams,
  IFindTagsParams,
  IImage,
  IImageReader,
  RETRY_SERVICE,
  RetryService
} from '@spinnaker/core';

export interface IDockerImage extends IImage {
  account: string;
  registry: string;
  repository: string;
  tag: string;
}

export class DockerImageReaderService implements IImageReader {

  constructor(private API: Api,
              private retryService: RetryService) {}

  // NB: not currently used or tested; only here to satisfy IImageReader interface
  public getImage(imageName: string, region: string, credentials: string): ng.IPromise<IDockerImage> {
    return this.API.all('images').one(credentials)
        .one(region)
        .one(imageName)
        .withParams({provider: 'docker'})
        .get()
        .then((results: IDockerImage[]) => results && results.length ? results[0] : null)
        .catch((): IDockerImage => null);
  }

  public findImages(params: IFindImageParams): ng.IPromise<IDockerImage[]> {
    return this.retryService.buildRetrySequence<IDockerImage[]>(() => this.API.all('images/find')
      .getList(params), (results: IDockerImage[]) => (results.length > 0), 10, 1000)
      .then((results: IDockerImage[]) => results)
      .catch((): IDockerImage[] => []);
  }

  public findTags(params: IFindTagsParams): ng.IPromise<string[]> {
    return this.retryService.buildRetrySequence<String[]>(() => this.API.all('images/tags')
      .getList(params), (results: string[]) => (results.length > 0), 10, 1000)
      .then((results: string[]) => results)
      .catch((): string[] => []);
  }
}

export const DOCKER_IMAGE_READER = 'spinnaker.docker.image.reader';
module(DOCKER_IMAGE_READER, [API_SERVICE, RETRY_SERVICE])
  .service('dockerImageReader', DockerImageReaderService);
