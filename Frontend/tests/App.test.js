import React from 'react';
import { render } from '@testing-library/react-native';
import IndexPage from  '../app/index';

describe('IndexPage', () => {
  it('renders correctly', () => {
    const { toJSON } = render(<IndexPage />);
    expect(toJSON()).toMatchSnapshot();
  });
});