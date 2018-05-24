import { Application } from 'core/application/application.model';
import { NotifierService } from 'core/widgets/notifier/notifier.service';

export class InferredApplicationWarningService {
  private static viewedApplications: string[] = [];

  public static resetViewedApplications(): void {
    this.viewedApplications.length = 0;
  }

  public static isInferredApplication(app: Application): boolean {
    return !app.attributes || !app.attributes.email;
  }

  public static checkIfInferredAndWarn(app: Application): void {
    if (this.check(app)) {
      this.warn(app.name);
    }
  }

  private static check(app: Application): boolean {
    const { name } = app;
    const hasViewed = this.viewedApplications.includes(name);

    this.viewedApplications.push(name);
    return !hasViewed && this.isInferredApplication(app);
  }

  private static warn(appName: string): void {
    NotifierService.publish({
      key: 'inferredApplicationWarning',
      action: 'create',
      body: `The application <b>${appName}</b> has not been <a href="#/applications/${appName}/config">configured</a>.`,
    });
  }
}
