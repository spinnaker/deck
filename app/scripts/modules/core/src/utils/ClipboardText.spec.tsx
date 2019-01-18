import * as React from 'react';
import { mount } from 'enzyme';

import { ClipboardText } from './ClipboardText';

describe('<ClipboardText />', () => {
  it('renders an input with the text value', () => {
    const wrapper = mount(<ClipboardText text="Rebel Girl" />);
    const input = wrapper.find('input');
    expect(input.get(0).props.value).toEqual('Rebel Girl');
  });
});
