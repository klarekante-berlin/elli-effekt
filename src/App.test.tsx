import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

test('renders scrollytelling site heading', () => {
  render(<App />);
  const headingElement = screen.getByText(/scrollytelling site/i);
  expect(headingElement).toBeInTheDocument();
});
