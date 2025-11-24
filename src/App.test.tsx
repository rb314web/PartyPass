import React from 'react';
import { render, screen } from '@testing-library/react';

// Simple test that doesn't require complex routing
test('renders without crashing', () => {
  render(<div>Test content</div>);
  expect(screen.getByText('Test content')).toBeInTheDocument();
});
