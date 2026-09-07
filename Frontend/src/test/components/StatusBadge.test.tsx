import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { StatusBadge } from '@/components/ui/StatusBadge';

// ─── F-C1: StatusBadge Component ─────────────────────────────────────────────

describe('StatusBadge', () => {
  it('renders status name correctly', () => {
    render(<StatusBadge status={{ name: 'On Verification', color: 'warning' }} />);
    expect(screen.getByText('On Verification')).toBeInTheDocument();
  });

  it('renders "Unknown" when status is null', () => {
    render(<StatusBadge status={null} />);
    expect(screen.getByText('Unknown')).toBeInTheDocument();
  });

  it('renders "Unknown" when status is undefined', () => {
    render(<StatusBadge />);
    expect(screen.getByText('Unknown')).toBeInTheDocument();
  });

  it('renders "Unknown" when status has no name', () => {
    render(<StatusBadge status={{ color: 'info' }} />);
    expect(screen.getByText('Unknown')).toBeInTheDocument();
  });

  it('renders all 9 submission statuses correctly', () => {
    const statuses = [
      { name: 'Pending Payment', color: 'warning' },
      { name: 'Document Submission', color: 'info' },
      { name: 'On Verification', color: 'primary' },
      { name: 'Revision Needed', color: 'danger' },
      { name: 'Certified', color: 'success' },
      { name: 'Payment Successful', color: 'success' },
      { name: 'Location Survey', color: 'warning' },
      { name: 'Passed Verification', color: 'success' },
      { name: 'Rejected', color: 'danger' },
    ];

    statuses.forEach((status) => {
      const { unmount } = render(<StatusBadge status={status} />);
      expect(screen.getByText(status.name)).toBeInTheDocument();
      unmount();
    });
  });

  it('applies custom className', () => {
    const { container } = render(
      <StatusBadge status={{ name: 'Active', color: 'success' }} className="custom-class" />
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('renders dot indicator', () => {
    const { container } = render(
      <StatusBadge status={{ name: 'Certified', color: 'success' }} />
    );
    // Dot is a span with rounded-full
    const dot = container.querySelector('span.rounded-full.w-1\\.5');
    expect(dot).not.toBeNull();
  });

  it('has correct color class for success status', () => {
    const { container } = render(
      <StatusBadge status={{ name: 'Certified', color: 'success' }} />
    );
    expect(container.firstChild).toHaveClass('text-emerald-700');
  });

  it('has correct color class for danger status', () => {
    const { container } = render(
      <StatusBadge status={{ name: 'Rejected', color: 'danger' }} />
    );
    expect(container.firstChild).toHaveClass('text-rose-700');
  });
});
