import { $q } from 'ngimport';

import { REST } from 'core/api/ApiService';
import { IBuild, IJobConfig, IGcbTrigger } from 'core/domain';

export enum BuildServiceType {
  Jenkins = 'jenkins',
  Travis = 'travis',
  Wercker = 'wercker',
  Concourse = 'concourse',
}

export class IgorService {
  public static listMasters(buildType: BuildServiceType = null): PromiseLike<string[]> {
    const allMasters: PromiseLike<string[]> = REST('/v2/builds').query({ type: buildType }).get();
    if (!allMasters) {
      return $q.reject('An error occurred when retrieving build masters');
    }
    switch (buildType) {
      case BuildServiceType.Jenkins:
        return allMasters.then((masters) => masters.filter((master) => !/^travis-/.test(master)));
      case BuildServiceType.Travis:
        return allMasters.then((masters) => masters.filter((master) => /^travis-/.test(master)));
      case BuildServiceType.Concourse:
        return allMasters.then((masters) => masters.filter((master) => /^concourse-/.test(master)));
      default:
        return allMasters;
    }
  }

  public static listJobsForMaster(master: string): PromiseLike<string[]> {
    return REST('/v2/builds').path(master, 'jobs').get();
  }

  public static listBuildsForJob(master: string, job: string): PromiseLike<IBuild[]> {
    return REST('/v2/builds').path(master, 'builds', job).get();
  }

  public static getJobConfig(master: string, job: string): PromiseLike<IJobConfig> {
    return REST('/v2/builds').path(master, 'jobs', job).get();
  }

  public static getGcbAccounts(): PromiseLike<string[]> {
    return REST('/gcb/accounts').get();
  }

  public static getGcbTriggers(account: string): PromiseLike<IGcbTrigger[]> {
    return REST('/gcb/triggers').path(account).get();
  }

  public static getCodeBuildAccounts(): PromiseLike<string[]> {
    return REST('/codebuild/accounts').get();
  }

  public static getCodeBuildProjects(account: string): PromiseLike<string[]> {
    return REST('/codebuild/projects').path(account).get();
  }
}
