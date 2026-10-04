import { render, screen } from '@testing-library/react';
import Page from '../../src/app/page';

describe('Pesmad App public shell', () => {
  it('identifies the product without exposing legacy credential fields', () => {
    render(<Page />);

    expect(screen.getByRole('heading', { name: 'PESMAD APP' })).toBeInTheDocument();
    expect(screen.queryByLabelText(/username/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/password/i)).not.toBeInTheDocument();
  });
});
