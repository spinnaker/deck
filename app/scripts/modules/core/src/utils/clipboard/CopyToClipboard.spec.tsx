import * as React from 'react';
import { mount } from 'enzyme';

import { CopyToClipboard } from './CopyToClipboard';

describe('<CopyToClipboard />', () => {
  it('renders an input with the text value', () => {
    const wrapper = mount(<CopyToClipboard toolTip="Copy Rebel Girl" value="Rebel Girl" />);
    const input = wrapper.find('input');
    expect(input.get(0).props.value).toEqual('Rebel Girl');
  });
});
