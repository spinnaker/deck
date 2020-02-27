import React from 'react';

interface IAutoscalerListItemProps {
  autoscaler: string;
  onItemClick: (autoscaler: string) => void;
}

export class AutoscalerListItem extends React.Component<IAutoscalerListItemProps> {
  private onClick = (e: React.MouseEvent<HTMLElement>): void => {
    e.stopPropagation();
    this.props.onItemClick(this.props.autoscaler);
  };

  public render(): React.ReactElement<AutoscalerListItem> {
    return (
      <button className="btn-link" onClick={this.onClick}>
        <span className="name">{this.props.autoscaler}</span>
      </button>
    );
  }
}
