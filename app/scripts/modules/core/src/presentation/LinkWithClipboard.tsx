import React from 'react';
import { CopyToClipboard } from 'core/utils';

export interface ILinkWithClipboardProps {
  url: string;
  text: string;
}

export const LinkWithClipboard = ({ url, text }: ILinkWithClipboardProps) => {
  // eslint-disable-next-line
  console.log('here', url, text);
  return (
    <>
      <a href={url} target="_blank">
        {text}
      </a>
      <CopyToClipboard className="copy-to-clipboard copy-to-clipboard-sm" text={text} toolTip="'Copy to clipboard'" />
    </>
  );
};
