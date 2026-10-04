import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { LoginForm } from '../../src/components/auth/LoginForm';

const replace = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
}));

describe('Pesmad LoginForm', () => {
  it('submits credentials and navigates to the requested protected path', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ profile: { nama: 'Ustadz Satu' } }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
      ),
    );

    render(<LoginForm nextPath="/dashboard" />);

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'ustadz01' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'secret' } });
    fireEvent.click(screen.getByRole('button', { name: /masuk/i }));

    await waitFor(() => expect(replace).toHaveBeenCalledWith('/dashboard'));
    expect(fetch).toHaveBeenCalledWith('/api/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ username: 'ustadz01', password: 'secret' }),
    });
  });

  it('shows a safe server error without exposing password text', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: 'Akses ditolak.' }), {
          status: 403,
          headers: { 'content-type': 'application/json' },
        }),
      ),
    );

    render(<LoginForm nextPath="/dashboard" />);

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'wali01' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'secret-value' } });
    fireEvent.click(screen.getByRole('button', { name: /masuk/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Akses ditolak.');
    expect(screen.queryByText('secret-value')).not.toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });
});
