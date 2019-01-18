import * as React from 'react';

export interface IClipboardTextProps {
  text: string;
}

/**
 * Places text in an invisible input field so we can auto-focus and select the text
 * then copy it to the clipboard onClick. Used in labels found in components like
 * ManifestStatus to make it easier to grab data from the UI.
 */
export class ClipboardText extends React.Component<IClipboardTextProps> {
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
    return (
      <input
        onClick={this.handleClick}
        onChange={e => e} // no-op to prevent warnings
        ref={this.textRef}
        value={text}
        type="text"
        style={this.inputStyle}
      />
    );
  }
}
