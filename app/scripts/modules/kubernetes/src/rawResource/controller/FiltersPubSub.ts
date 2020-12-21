import { IK8sResourcesFiltersState } from '../component/K8sResourcesFilters';

export interface ISubcriber {
  notify(message: IK8sResourcesFiltersState): void;
}

export class FiltersPubSub {
  private subcribers: ISubcriber[] = [];
  private static intances: Record<string, FiltersPubSub> = {};

  private constructor() {}

  public static getInstance(name: string) {
    let instance = FiltersPubSub.intances[name];
    if (!FiltersPubSub.intances[name]) {
      FiltersPubSub.intances[name] = new FiltersPubSub();
      instance = FiltersPubSub.intances[name];
    }
    return instance;
  }

  public subscribe(subcriber: (message: IK8sResourcesFiltersState) => void) {
    this.subcribers.push({ notify: subcriber });
  }

  public publish(message: IK8sResourcesFiltersState) {
    this.subcribers.forEach((sub) => sub.notify(message));
  }
}
