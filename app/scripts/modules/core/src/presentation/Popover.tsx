import * as React from 'react';
import { OverlayTrigger, Popover as BSPopover } from 'react-bootstrap';

import { Placement } from 'core/presentation/Placement';

export interface IProps {
  value?: string;
  template?: JSX.Element;
  placement?: Placement;
  container?: any;
}

export class Popover extends React.Component<IProps, void> {
  public static defaultProps: Partial<IProps> = {
    placement: 'top',
    value: ''
  };

  public render() {
    const { value, template, placement, container, children } = this.props;
    let popover = <BSPopover id={value}>{value}</BSPopover>;
    if (template) {
      popover = <BSPopover id={value}>{template}</BSPopover>;
    }

    return (
      <OverlayTrigger placement={placement} overlay={popover} container={container}>
        {children}
      </OverlayTrigger>
    );
  }
}
