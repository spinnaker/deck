import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Overlay, Popover, PopoverProps } from 'react-bootstrap';
import autoBindMethods from 'class-autobind-decorator';

import {Placement} from 'core/presentation/Placement';
import {UUIDGenerator} from 'core/utils';

export interface IProps {
  value?: string;
  template?: JSX.Element;

  placement?: Placement;
  /** a percent string between 0% and 100% */
  offset?: string;
  className?: string;
  title?: string;
  id?: string;
  onShow?: () => void;
  onHide?: () => void;
}

export interface IState {
  popoverIsOpen: boolean;
  target?: any;
  PopoverRenderer?: React.ComponentClass<PopoverProps> | React.StatelessComponent<PopoverProps>;
}

@autoBindMethods
export class HoverablePopover extends React.Component<IProps, IState> {
  public static defaultProps: Partial<IProps> = {
    placement: 'top',
    id: UUIDGenerator.generateUuid(),
  };

  private popoverCancel: number;

  /**
   * Renders a Popover offset to the left or right.
   * offetPercent: a percent string between 0 and 99, e.g.: `50%`, `12%` or `90%`
   */
  private static popoverOffsetRenderer(offsetPercent: string) {
    interface IOffsetState {
      offset: number,
    }

    return class extends React.Component<PopoverProps, IOffsetState> {
      public state: IOffsetState = {
        offset: null,
      };

      public componentDidMount() {
        this.setState(this.getState(this.props));
      }

      public componentWillReceiveProps(newProps: PopoverProps) {
        this.setState(this.getState(newProps));
      }

      public getState(props: PopoverProps): IOffsetState {
        const parsePercent = (str: string) => {
          const match = /(\d+(?:\.\d+)?)%/.exec(str);
          return match ? parseFloat(match[1]) / 100 : .5;
        };

        const desiredPercent = parsePercent(offsetPercent);
        const currentPercent = parsePercent(props.arrowOffsetLeft as string);
        const deltaPercent = (desiredPercent - currentPercent);

        const width = ReactDOM.findDOMNode(this).clientWidth;
        const offset = 0 - (width * deltaPercent);

        return { offset: offset };
      }

      public render(): any {
        const { offset } = this.state;
        if (offset) {
          const { style } = this.props;
          const offsetStyle = Object.assign({}, style, { left: style.left + offset });
          return <Popover {...this.props} style={offsetStyle} arrowOffsetLeft={offsetPercent} />
        } else {
          return <Popover {...this.props} />
        }
      }
    }
  }

  constructor(props: IProps) {
    super(props);

    this.state = {
      popoverIsOpen: false,
      PopoverRenderer: HoverablePopover.popoverOffsetRenderer(props.offset),
    };
  }

  public componentWillUnmount() {
    this.hidePopover();
  }

  private showPopover(e: React.MouseEvent<HTMLElement>): void {
    this.clearPopoverCancel();
    this.setState({popoverIsOpen: true, target: e.target});
    this.props.onShow && this.props.onShow();
  }

  private deferHidePopover(): void {
    this.popoverCancel = window.setTimeout(() => this.hidePopover(), 300);
  }

  private hidePopover(): void {
    this.clearPopoverCancel();
    this.setState({popoverIsOpen: false});
    this.props.onHide && this.props.onHide();
  }

  private clearPopoverCancel(): void {
    if (this.popoverCancel) {
      window.clearTimeout(this.popoverCancel);
    }
    this.popoverCancel = null;
  }

  public render() {
    const PopoverContents = this.props.template;
    const PopoverRenderer = this.state.PopoverRenderer;
    return (
      <span onMouseEnter={this.showPopover} onMouseLeave={this.deferHidePopover}>
        {this.props.children}
        <Overlay show={this.state.popoverIsOpen} placement={this.props.placement} onEnter={this.clearPopoverCancel} target={this.state.target}>
          <PopoverRenderer
            onMouseOver={this.clearPopoverCancel}
            onMouseLeave={this.hidePopover}
            onBlur={this.hidePopover}
            id={this.props.id}
            title={this.props.title}
            className={this.props.className}
          >
            {PopoverContents}
          </PopoverRenderer>
        </Overlay>
      </span>
    );
  }
}
