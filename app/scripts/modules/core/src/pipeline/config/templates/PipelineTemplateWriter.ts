
import { $q } from 'ngimport';
import { API } from 'core/api/ApiService';
import { IPipelineTemplateV2 } from 'core/domain/IPipelineTemplateV2';

export class PipelineTemplateWriter {
  public static savePipelineTemplateV2(template: IPipelineTemplateV2): PromiseLike<any> {
    return $q((resolve, reject) => {
      API.one('v2').one('pipelineTemplates').one('create').post(template).then(resolve, reject);
    });
  }

  public static deleteTemplate(template: { id: string; digest?: string; tag?: string }): PromiseLike<any> {
    let request = API.one('v2').one('pipelineTemplates').one(template.id);

    const params: { digest?: string; tag?: string } = {};
    if (template.digest) {
      params.digest = template.digest;
    } else if (template.tag) {
      params.tag = template.tag;
    }

    request = request.withParams(params);
    return request.remove();
  }
}
