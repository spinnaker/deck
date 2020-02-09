import React from 'react';

import { Tooltip } from 'core/presentation/Tooltip';

interface IAutoscalerListItemProps {
  name: string;
  onItemClick: (autoscaler: string) => void;
}

export class AutoscalerButton extends React.Component<IAutoscalerListItemProps> {
  private onClick = (e: React.MouseEvent<HTMLElement>): void => {
    e.stopPropagation();
    this.props.onItemClick(this.props.name);
  };

  public render(): React.ReactElement<AutoscalerButton> {
    return (
      <Tooltip value={`Autoscaler: ${this.props.name}`}>
        <button className="btn btn-link no-padding" onClick={this.onClick}>
          <span className="badge badge-counter">
            <span className="icon">
              <i className="fa icon-balance-scale" />
            </span>
          </span>
        </button>
      </Tooltip>
    );
  }
}
