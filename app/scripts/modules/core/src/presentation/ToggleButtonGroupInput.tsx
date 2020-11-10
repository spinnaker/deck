import React from 'react';

import { Tooltip } from './Tooltip';
import { HelpField } from '../help';

export interface IToggleButtonGroupInputProps {
  propLabel: string;
  propHelpFieldId?: string;
  btnGroupSize?: string;
  tooltipPropOnBtn?: string;
  displayTextPropOnBtn?: string;
  tooltipPropOffBtn?: string;
  displayTextPropOffBtn?: string;
  onClick: (value: boolean) => void;
  isPropertyActive?: boolean;
}

export class ToggleButtonGroupInput extends React.Component<IToggleButtonGroupInputProps> {
  public static defaultProps: Partial<IToggleButtonGroupInputProps> = {
    btnGroupSize: 'btn-group-xs',
    displayTextPropOffBtn: 'Off',
    tooltipPropOffBtn: 'Toggle to turn OFF',
    displayTextPropOnBtn: 'On',
    tooltipPropOnBtn: 'Toggle to turn ON',
    isPropertyActive: false,
  };

  private btnClicked(isPropertyActive: boolean): void {
    this.props.onClick(isPropertyActive);
  }

  public render() {
    return (
      <div>
        <div className="col-md-4 sm-label-left">
          <b>{this.props.propLabel}</b>
          {this.props.propHelpFieldId && <HelpField id={this.props.propHelpFieldId} />}
        </div>
        <div className="col-md-8 sm-label-left">
          <span className={`btn-group ${this.props.btnGroupSize}`}>
            <button
              name="prop-off"
              type="button"
              className={`btn btn-default ${!this.props.isPropertyActive ? 'active btn-primary' : 'disabled'}`}
              onClick={() => this.btnClicked(false)}
            >
              <Tooltip value={this.props.tooltipPropOffBtn}>
                <span>{this.props.displayTextPropOffBtn}</span>
              </Tooltip>
            </button>
            <button
              name="prop-on"
              type="button"
              className={`btn btn-default ${this.props.isPropertyActive ? 'active btn-primary' : 'disabled'}`}
              onClick={() => this.btnClicked(true)}
            >
              <Tooltip value={this.props.tooltipPropOnBtn}>
                <span>{this.props.displayTextPropOnBtn}</span>
              </Tooltip>
            </button>
          </span>
        </div>
      </div>
    );
  }
}
