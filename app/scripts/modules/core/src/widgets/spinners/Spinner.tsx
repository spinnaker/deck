import * as React from 'react';
import autoBindMethods from 'class-autobind-decorator';
const Logo = require('./logo.svg');

export interface ISpinnerProps {
  size?: string;
  message?: string;
  postnote?: string;
}

@autoBindMethods
export class Spinner extends React.Component<ISpinnerProps, {}> {
  static propTypes = {
    size: React.PropTypes.oneOf(['nano', 'small', 'medium', 'large', 'page']),
    message: React.PropTypes.string,
    postnote: React.PropTypes.string
  }

  getBarRows = (count: number) => {
    const rows = [];
    let i: number;
    for (i = 0; i < count; i++) {
      rows.push(<div className="bar" />)
    }
    return rows;
  }

  renderNano = () => {
    return (
      <div className="load nano">
        {this.getBarRows(1).map(bar => bar)}
      </div>
    )
  }

  renderSmall = () => {
    return (
      <div className="load small">
        {this.getBarRows(3).map(bar => bar)}
      </div>
    )
  }

  renderMedium = () => {
    const { message } = this.props;
    return (
      <div className="load medium">
        <div className="message color-text-accent heading-4">
          {message || "Loading ..."}
        </div>
        <div className="bars">
          {this.getBarRows(3).map(bar => bar)}
        </div>
      </div>
    )
  }

  renderLarge = () => {
    const { message } = this.props;
    return (
      <div className="load large">
        <div className="message color-text-accent heading-2">
          {message || 'Loading ...'}
        </div>
        <div className="bars">
          {this.getBarRows(5).map(bar => bar)}
        </div>
      </div>
    )
  }

  renderPageLoader = () => {
    const { message, postnote } = this.props;
    return (
      <div className="styleguide">
        <div className="load large vertical center">
          <Logo />
          <div className="message color-text-accent heading-2">{message || 'Loading ...'}</div>
          <div className="bars">
            {this.getBarRows(5).map(bar => bar)}
          </div>
          <div className="postnote">{postnote}</div>
        </div>
      </div>
    )
  }

  render() {
    switch ((this.props.size && this.props.size.toLowerCase()) || null) {
      case 'nano':
        return this.renderNano();
      case 'small':
        return this.renderSmall();
      case 'medium':
        return this.renderMedium();
      case 'large':
        return this.renderLarge();
      case 'page':
        return this.renderPageLoader();
      default:
        return this.renderSmall();
    }
  }
}
