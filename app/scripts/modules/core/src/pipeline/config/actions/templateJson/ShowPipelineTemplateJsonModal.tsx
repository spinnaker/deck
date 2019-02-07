import * as React from 'react';
import { cloneDeep } from 'lodash';
import { IModalComponentProps, JsonEditor } from 'core/presentation';
import { IPipeline, IPipelineTemplateV2 } from 'core/domain';
import { CopyToClipboard, noop, JsonUtils } from 'core/utils';
import { PipelineTemplateV2Service } from 'core/pipeline/config/templates/v2/pipelineTemplateV2.service';
import './showPipelineTemplateJsonModal.less';

const commandCopy = 'Copy "spin pipeline-templates save" command to clipboard';

export interface IShowPipelineTemplateJsonModalProps extends IModalComponentProps {
  ownerEmail: string;
  pipeline: IPipeline;
}

export interface IShowPipelineTemplateJsonModalState {
  template: IPipelineTemplateV2;
}

export class ShowPipelineTemplateJsonModal extends React.Component<
  IShowPipelineTemplateJsonModalProps,
  IShowPipelineTemplateJsonModalState
> {
  public static defaultProps: Partial<IShowPipelineTemplateJsonModalProps> = {
    dismissModal: noop,
  };

  constructor(props: IShowPipelineTemplateJsonModalProps) {
    super(props);

    const template = PipelineTemplateV2Service.createPipelineTemplate(cloneDeep(props.pipeline), props.ownerEmail);
    this.state = { template };
  }

  private onChange = (e: React.ChangeEvent<HTMLInputElement>, property: string) =>
    this.setState({
      template: {
        ...this.state.template,
        metadata: {
          ...this.state.template.metadata,
          [property]: e.target.value,
        },
      },
    });

  public render() {
    const { dismissModal } = this.props;
    const { template } = this.state;
    const templateStr = JsonUtils.makeSortedStringFromObject(template);

    return (
      <div className="flex-fill">
        <div className="modal-header">
          <h3>Pipeline Template JSON</h3>
        </div>
        <div className="modal-body flex-fill">
          <p>The JSON below represents the derived template from the pipeline configuration in its persisted state.</p>
          <form className="pipeline-template-form">
            <h4>Edit Template</h4>
            <div className="form-group">
              <label htmlFor="template-name">Name</label>
              <input
                id="template-name"
                className="form-control input-sm"
                type="text"
                value={template.metadata.name}
                onChange={e => this.onChange(e, 'name')}
              />
            </div>
            <div className="form-group">
              <label htmlFor="template-description">Description</label>
              <input
                id="template-description"
                className="form-control input-sm"
                type="text"
                value={template.metadata.description}
                onChange={e => this.onChange(e, 'description')}
                placeholder="Template Description"
              />
            </div>
            <div className="form-group">
              <label htmlFor="template-owner">Owner</label>
              <input
                id="template-owner"
                className="form-control input-sm"
                type="text"
                value={template.metadata.owner}
                onChange={e => this.onChange(e, 'owner')}
              />
            </div>
            <div className="form-group">
              <label className="pipeline-template-form__copy">
                {commandCopy}
                <CopyToClipboard text={`echo '${templateStr}' | spin pipeline-templates save`} toolTip={commandCopy} />
              </label>
            </div>
          </form>
          <JsonEditor value={templateStr} readOnly />
        </div>
        <div className="modal-footer">
          <button className="btn btn-default" onClick={dismissModal}>
            Cancel
          </button>
        </div>
      </div>
    );
  }
}
