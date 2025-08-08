import { render, screen } from '@testing-library/react';

function Page() {
  return <main>Hello</main>;
}

test('page', () => {
  render(<Page />);
  expect(screen.getByText('Hello')).toBeInTheDocument();
});
