import * as React from 'react';

import { NgReact } from 'core/reactShims/ngReact';
import { IPipelineTemplate } from 'core/pipeline/config/templates/pipelineTemplate.service';
import { SETTINGS } from 'core/config/settings';

import './TemplateDescription.less';

export interface ITemplateDescriptionProps {
  template: IPipelineTemplate;
  loading: boolean;
  loadingError: boolean;
}

export class TemplateDescription extends React.Component<ITemplateDescriptionProps> {
  public render() {
    const { Spinner } = NgReact;
    return (
      <div className="col-md-12 template-description">
        {this.props.loading && (
          <div className="spinner">
            <Spinner radius={5} width={3} length={8} />
          </div>
        )}
        {this.props.template && (
          <div className="alert alert-info">
            <strong>{this.props.template.metadata.name}</strong>
            {this.props.template.selfLink && (
              <p className="small">
                <a href={this.buildTemplateResolutionLink(this.props.template.selfLink)} target="_blank">
                  {this.props.template.selfLink}
                </a>
              </p>
            )}
            {this.props.template.metadata.owner && (<p className="small">{this.props.template.metadata.owner}</p>)}
            <p className="small">{this.props.template.metadata.description || 'No template description provided.'}</p>
          </div>
        )}
        {this.props.loadingError && (
          <div className="alert alert-danger">
            <p>There was an error loading the template.</p>
          </div>
        )}
      </div>
    );
  }

  private buildTemplateResolutionLink(templateLink: string): string {
    return `${SETTINGS.gateUrl}/pipelineTemplates/resolve?source=${templateLink}`;
  }
}
