import { IStage } from 'core/domain';
import { get, isEmpty, noop } from 'lodash';
import { Registry } from 'core';

export type SupportedStage = 'stage';

export type IWalker = (refContainer: any) => Array<Array<string | number>>;

interface IReference {
  category: SupportedStage;
  walker: IWalker;
}

export class ArtifactReferenceService {
  private static references: IReference[] = [];

  public static registerReference(category: SupportedStage, walker: IWalker) {
    ArtifactReferenceService.references.push({ category, walker });
  }

  public static removeReferenceFromStages(reference: string, stages: IStage[]) {
    (stages || []).forEach(stage => {
      ArtifactReferenceService.references.forEach(ref => {
        const paths: Array<Array<string | number>> = ref.walker(stage).filter(path => !isEmpty(path));
        paths.map(p => p.slice(0)).forEach(path => {
          let tail = path.pop();
          let obj = stage;
          if (path.length > 0) {
            obj = get(stage, path);
          }
          if (Array.isArray(obj[tail])) {
            obj = obj[tail];
            tail = obj.indexOf(reference);
          }
          if (obj[tail] !== reference) {
            return;
          }
          if (Array.isArray(obj)) {
            obj.splice(tail as number, 1);
          } else {
            delete obj[tail];
          }
        });
      });
      const stageConfig = Registry.pipeline.getStageConfig(stage);
      const artifactRemover = get(stageConfig, ['artifactRemover'], noop);
      artifactRemover(stage, reference);
    });
  }

  public static removeArtifactFromField(field: string, obj: { [key: string]: string | string[] }, artifactId: string) {
    if (Array.isArray(obj[field])) {
      obj[field] = (obj[field] as string[]).filter((a: string) => a !== artifactId);
    } else if (obj[field] === artifactId) {
      delete obj[field];
    }
  }

  public static removeArtifactFromFields(fields: string[]): (stage: IStage, artifactId: string) => void {
    return (stage: IStage, artifactId: string) =>
      fields.forEach(field => this.removeArtifactFromField(field, stage, artifactId));
  }

  public static deregisterAll() {
    ArtifactReferenceService.references = [];
  }
}
