import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Sidebar from './Sidebar';
import { algorithmsList } from '@/data/algorithms_content';

vi.mock('next/navigation', () => ({
  usePathname: () => '/algorithms/linear-regression',
}));

describe('Sidebar', () => {
  it('shows the current module and its schema-backed learning track', () => {
    render(<Sidebar />);

    expect(screen.getByRole('complementary', { name: 'Study navigator' })).toBeInTheDocument();
    expect(screen.getByText('Current module')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Linear Regression' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'ML Practitioner' })).toHaveAttribute(
      'href',
      '/tracks#track-practitioner',
    );
    expect(screen.getByText(`${algorithmsList.length} modules · 1 interactive lab`)).toBeInTheDocument();
  });

});
