import { render, screen } from '@testing-library/react';

function Button() {
  return <button>OK</button>;
}

test('render', () => {
  render(<Button />);
  expect(screen.getByText('OK')).toBeInTheDocument();
});
