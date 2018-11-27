import * as React from 'react';
import Select, { Option } from 'react-select';

import { IEntityRef, IEntityTag, IStage } from 'core/domain';
import { IStageConfigProps, StageConfigField } from 'core/pipeline';
import { SETTINGS } from 'core/config/settings';

import { TagEditor } from './TagEditor';
import { FormField, ReactSelectInput, StringsAsOptions } from 'core/presentation';

export interface IApplyEntityTagsStage extends IStage {
  entityRef: IEntityRef;
  tags: IEntityTag[];
}

export interface IApplyEntityTagsStageConfigProps extends IStageConfigProps {
  stage: IApplyEntityTagsStage;
}

export class ApplyEntityTagsStageConfig extends React.Component<IApplyEntityTagsStageConfigProps> {
  private entityOptions = [
    { label: 'Server Group', value: 'servergroup' },
    { label: 'Load Balancer', value: 'loadbalancer' },
    { label: 'Application', value: 'application' },
    { label: 'Cluster', value: 'cluster' },
    { label: 'Security Group', value: 'securitygroup' },
  ];

  private entityRefTypeChanged = (entityType: string) => {
    const entityRef = { entityType };
    this.props.updateStageField({ entityRef });
  };

  private entityRefFieldChanged = (key: string, value: string) => {
    const entityRef = { ...this.props.stage.entityRef, ...{ [key]: value } };
    this.props.updateStageField({ entityRef });
  };

  private tagChanged = (tag: IEntityTag, index: number) => {
    const tags = this.props.stage.tags.slice();
    tags[index] = tag;
    this.props.updateStageField({ tags });
  };

  private addTag = () => {
    this.props.stage.tags.push({ name: '', value: '' });
    this.props.updateStageField({ tags: this.props.stage.tags });
  };

  public render() {
    const {
      stage: { entityRef = {} as IEntityRef, tags = [] as IEntityTag[] },
      application: {
        attributes: { cloudProviders = SETTINGS.defaultProviders },
      },
    } = this.props;

    return (
      <div className="form-horizontal">
        <StageConfigField label="Entity Type">
          <Select
            clearable={false}
            options={this.entityOptions}
            onChange={(o: Option<string>) => this.entityRefTypeChanged(o.value)}
            value={entityRef.entityType || ''}
          />
        </StageConfigField>
        {entityRef.entityType && (
          <>
            <StageConfigField label="Name">
              <input
                className="form-control input-sm"
                value={entityRef.entityId || ''}
                onChange={e => this.entityRefFieldChanged('entityId', e.target.value)}
              />
            </StageConfigField>
            {entityRef.entityType !== 'application' && (
              <>
                <StageConfigField label="Cloud Provider">
                  <FormField
                    input={fieldProps => (
                      <StringsAsOptions strings={cloudProviders}>
                        {options => (
                          <ReactSelectInput
                            {...fieldProps}
                            options={options}
                            clearable={false}
                            className="full-width"
                          />
                        )}
                      </StringsAsOptions>
                    )}
                    value={entityRef.cloudProvider || ''}
                    onChange={e => this.entityRefFieldChanged('cloudProvider', e.target.value)}
                  />
                </StageConfigField>
                <StageConfigField label="Account">
                  <input
                    className="form-control input-sm"
                    value={entityRef.account || ''}
                    onChange={e => this.entityRefFieldChanged('account', e.target.value)}
                  />
                </StageConfigField>
                <StageConfigField label="Region" helpKey="pipeline.config.entitytags.region">
                  <input
                    className="form-control input-sm"
                    value={entityRef.region || ''}
                    onChange={e => this.entityRefFieldChanged('region', e.target.value)}
                  />
                </StageConfigField>
                {entityRef.entityType === 'securitygroup' && (
                  <StageConfigField label="VPC Id">
                    <input
                      className="form-control input-sm"
                      value={entityRef.vpcId || ''}
                      onChange={e => this.entityRefFieldChanged('vpcId', e.target.value)}
                    />
                  </StageConfigField>
                )}
              </>
            )}
          </>
        )}
        <StageConfigField label="Tags">
          {tags.map((tag, index) => (
            <TagEditor key={index} tag={tag} onChange={t => this.tagChanged(t, index)} />
          ))}
          <button type="button" className="add-new col-md-12" onClick={this.addTag}>
            <span className="glyphicon glyphicon-plus-sign" /> Add new tag
          </button>
        </StageConfigField>
      </div>
    );
  }
}
