import * as React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

import './ClipboardText.less';

export interface IClipboardTextProps {
  text: string;
}

/**
 * Places text in an invisible input field so we can auto-focus and select the text
 * then copy it to the clipboard onClick. Used in labels found in components like
 * ManifestStatus to make it easier to grab data from the UI.
 *
 * This component mimics utils/clipboard/copyToClipboard.component.ts but
 * since the text is placed in an invisible input its very easy to select
 * if the copy fails.
 */
export class ClipboardText extends React.Component<IClipboardTextProps> {
  public state = {
    tooltipCopy: false,
  };

  private textRef: React.RefObject<HTMLInputElement> = React.createRef();

  private inputStyle = {
    borderWidth: '0px',
    display: 'inline-block',
    backgroundColor: 'transparent',
  };

  /**
   * Focuses on the input element and attempts to copy to the clipboard.
   * Also updates state.tooltipCopy with a success/fail message, which is
   * reset after 3s. The selection is immediately blur'd so you shouldn't
   * see much of it during the copy.
   */
  public handleClick = (e: React.SyntheticEvent) => {
    e.preventDefault();
    const { text } = this.props;
    const node: HTMLInputElement = this.textRef.current;
    node.focus();
    node.select();

    try {
      document.execCommand('copy');
      node.blur();
      this.setState({ tooltipCopy: `Copied ${text}` });
      window.setTimeout(this.resetToolTip, 3000);
    } catch (e) {
      this.setState({ tooltipCopy: "Couldn't copy!" });
    }
  };

  public resetToolTip = () => {
    this.setState({ tooltipCopy: false });
  };

  public render() {
    const { text } = this.props;
    const { tooltipCopy } = this.state;

    const copy = tooltipCopy || `Copy ${text}`;
    const tooltip = <Tooltip id={`clipboardText-${text.replace(' ', '-')}`}>{copy}</Tooltip>;

    return (
      <React.Fragment>
        <input
          onChange={e => e} // no-op to prevent warnings
          ref={this.textRef}
          value={text}
          type="text"
          style={this.inputStyle}
        />
        <OverlayTrigger placement="top" overlay={tooltip}>
          <button
            onClick={this.handleClick}
            className="btn btn-xs btn-default clipboard-btn"
            uib-tooltip={`Copy ${text}`}
            aria-label="Copy to clipboard"
          >
            <span className="glyphicon glyphicon-copy" />
          </button>
        </OverlayTrigger>
      </React.Fragment>
    );
  }
}
