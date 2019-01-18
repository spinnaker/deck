import * as React from 'react';

export class ClipboardText extends React.Component<any> {
  private textRef: React.RefObject<HTMLInputElement> = React.createRef();

  private inputStyle = {
    borderWidth: '0px',
    backgroundColor: 'transparent',
  };

  public handleClick = (e: React.SyntheticEvent) => {
    e.preventDefault();
    const node: HTMLInputElement = this.textRef.current;
    node.focus();
    node.select();

    try {
      document.execCommand('copy');
    } catch (e) {
      /* don't do anything */
    }
  };

  public render() {
    const { text } = this.props;
    return <input onClick={this.handleClick} ref={this.textRef} value={text} type="text" style={this.inputStyle} />;
  }
}
