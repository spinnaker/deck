import * as React from 'react';
import { mount } from 'enzyme';

import { CopyToClipboard } from './CopyToClipboard';

describe('<CopyToClipboard />', () => {
  it('renders an input with the text value', () => {
    const wrapper = mount(<CopyToClipboard toolTip="Copy Rebel Girl" text="Rebel Girl" />);
    const input = wrapper.find('input');
    expect(input.get(0).props.value).toEqual('Rebel Girl');
  });

  it('Mouseover/click triggers overlay with toolTip', () => {
    const wrapper = mount(<CopyToClipboard toolTip="Copy Rebel Girl" text="Rebel Girl" />);
    const button = wrapper.find('button');
    button.simulate('mouseOver');

    // Grab the overlay from document by generated ID
    const overlay = document.getElementById('clipboardValue-Rebel-Girl');
    expect(overlay.innerText).toEqual('Copy Rebel Girl');

    // Click replaces overlay text with padding + Copied!
    button.simulate('click');
    expect(overlay.innerText).toEqual('    Copied!    ');
  });
});
