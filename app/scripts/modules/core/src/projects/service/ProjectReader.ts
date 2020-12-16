import { REST } from 'core/api';
import { IProject, IProjectCluster } from 'core/domain';

export class ProjectReader {
  public static listProjects(): PromiseLike<IProject[]> {
    return REST('/projects').get();
  }

  public static getProjectConfig(projectName: string): PromiseLike<IProject> {
    return REST('/projects').path(projectName).get();
  }

  public static getProjectClusters(projectName: string): PromiseLike<IProjectCluster[]> {
    return REST('/projects').path(projectName, 'clusters').get();
  }
}
