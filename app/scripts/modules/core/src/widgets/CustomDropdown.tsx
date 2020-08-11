import React from 'react';
import { DropdownMenuProps } from 'react-bootstrap';
import RootCloseWrapper from 'react-overlays/lib/RootCloseWrapper';

import { noop } from '../utils';

export interface IToggleProps {
  bsRole: string;
  onClick?: React.EventHandler<React.MouseEvent<HTMLAnchorElement>>;
}

export class CustomToggle extends React.Component<IToggleProps, {}> {
  constructor(props: IToggleProps) {
    super(props);
  }

  private handleClick = (e: React.MouseEvent<HTMLAnchorElement>): void => {
    e.preventDefault();
    this.props.onClick(e);
  };

  public render() {
    return (
      <a onClick={this.handleClick} className="remove-border-top">
        {this.props.children}
      </a>
    );
  }
}

export interface IMenuProps extends DropdownMenuProps {
  bsRole: string;
}

export interface IMenuState {
  value: string;
}
export class CustomMenu extends React.Component<IMenuProps, IMenuState> {
  static defaultProps = {
    onClose: noop,
  };
  constructor(props: IMenuProps) {
    super(props);
    this.state = { value: '' };
  }

  public render() {
    const { children, open, onClose } = this.props;

    return (
      <RootCloseWrapper disabled={!open} onRootClose={e => onClose(e, { source: 'rootClose' })}>
        <ul className="dropdown-menu" style={{ padding: '' }}>
          {React.Children.toArray(children)}
        </ul>
      </RootCloseWrapper>
    );
  }
}
