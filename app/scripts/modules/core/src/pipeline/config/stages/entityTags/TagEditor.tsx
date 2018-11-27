import * as React from 'react';
import { set } from 'lodash';
import Select, { Option } from 'react-select';

import { IEntityTag } from 'core/domain';
import { HelpField } from 'core/help/HelpField';
import { UUIDGenerator } from 'core/utils';

import './TagEditor.less';

export type EntityTagType = 'notice' | 'alert' | 'custom';

export interface ITagEditorProps {
  onChange: (tag: IEntityTag) => void;
  tag: IEntityTag;
}

export interface ITagEditorState {
  type: EntityTagType;
  valueIsObject: boolean;
}

const typeOptions: Array<Option<EntityTagType>> = [
  { label: 'Notice', value: 'notice' },
  { label: 'Alert', value: 'alert' },
  { label: 'Custom', value: 'custom' },
];

export class TagEditor extends React.Component<ITagEditorProps, ITagEditorState> {
  constructor(props: ITagEditorProps) {
    super(props);

    const type = props.tag.name.startsWith('spinnaker_ui_notice')
      ? 'notice'
      : props.tag.name.startsWith('spinnaker_ui_alert')
        ? 'alert'
        : 'custom';

    const valueIsObject = typeof props.tag.value === 'object';

    this.state = {
      type,
      valueIsObject,
    };
  }

  public componentWillReceiveProps(nextProps: ITagEditorProps) {
    const valueIsObject = typeof nextProps.tag.value === 'object';
    this.setState({ valueIsObject });
  }

  private handleTypeChanged = (type: EntityTagType) => {
    this.setState({ type });

    const tag = { ...this.props.tag };
    if (type !== 'custom') {
      delete tag.namespace;
      tag.name = `spinnaker_ui_${type}:${UUIDGenerator.generateUuid()}`;
      tag.value = {
        type,
        message: '',
      };
    } else {
      tag.name = '';
      tag.value = '';
    }
    this.props.onChange(tag);
  };

  private tagValueChanged = (key: string, value: any) => {
    if (key === 'value') {
      try {
        value = JSON.parse(value);
      } catch (e) {}
    }
    const tag = { ...this.props.tag };
    set(tag, key, value);
    this.props.onChange(tag);
  };

  public render() {
    const { tag } = this.props;
    const { type, valueIsObject } = this.state;

    const value = valueIsObject ? JSON.stringify(this.props.tag.value) : this.props.tag.value;

    const namespaceInput =
      type === 'custom' ? (
        <div className="row">
          <label className="col-md-3 sm-label-right">
            Namespace <HelpField id="pipeline.config.entitytags.namespace" />
          </label>
          <div className="col-md-8">
            <input
              className="form-control input-sm"
              value={tag.namespace || ''}
              onChange={event => this.tagValueChanged('namespace', event.target.value)}
              type="text"
            />
          </div>
        </div>
      ) : null;

    const nameInput =
      type === 'custom' ? (
        <div className="row">
          <label className="col-md-3 sm-label-right">Name</label>
          <div className="col-md-8">
            <input
              className="form-control input-sm"
              value={tag.name || ''}
              onChange={event => this.tagValueChanged('name', event.target.value)}
              type="text"
            />
          </div>
        </div>
      ) : null;

    const valueInput =
      type === 'custom' ? (
        <div className="row">
          <label className="col-md-3 sm-label-right">
            Value <HelpField id="pipeline.config.entitytags.value" />
          </label>
          <div className="col-md-8">
            <input
              className="form-control input-sm"
              value={value || ''}
              onChange={event => this.tagValueChanged('value', event.target.value)}
              type="text"
            />
          </div>
        </div>
      ) : (
        <div className="row">
          <label className="col-md-3 sm-label-right">Message</label>
          <div className="col-md-8">
            <input
              className="form-control input-sm"
              value={tag.value.message || ''}
              onChange={event => this.tagValueChanged('value.message', event.target.value)}
              type="text"
            />
          </div>
        </div>
      );

    return (
      <div className="TagEditor">
        <div className="row">
          <label className="col-md-3 sm-label-right">Type</label>
          <div className="col-md-8">
            <Select
              clearable={false}
              required={true}
              options={typeOptions}
              onChange={(t: Option<EntityTagType>) => this.handleTypeChanged(t.value)}
              value={type}
            />
          </div>
        </div>
        {namespaceInput}
        {nameInput}
        {valueInput}
        {/* if notice or alert, show message instead of value */}
      </div>
    );
  }
}
