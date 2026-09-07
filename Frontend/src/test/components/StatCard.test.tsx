import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Users } from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';

// ─── F-C2: StatCard Component ─────────────────────────────────────────────────

describe('StatCard', () => {
  const defaultProps = {
    title: 'Total Users',
    value: 120,
    icon: Users,
  };

  it('renders title correctly', () => {
    render(<StatCard {...defaultProps} />);
    expect(screen.getByText('Total Users')).toBeInTheDocument();
  });

  it('renders numeric value correctly', () => {
    render(<StatCard {...defaultProps} />);
    expect(screen.getByText('120')).toBeInTheDocument();
  });

  it('renders string value correctly', () => {
    render(<StatCard {...defaultProps} value="Rp 1.500.000" />);
    expect(screen.getByText('Rp 1.500.000')).toBeInTheDocument();
  });

  it('renders subtitle when provided', () => {
    render(<StatCard {...defaultProps} subtitle="vs last month" />);
    expect(screen.getByText('vs last month')).toBeInTheDocument();
  });

  it('does not render subtitle section when not provided', () => {
    render(<StatCard {...defaultProps} />);
    // No border-t divider at bottom when no subtitle/trend
    expect(screen.queryByText('vs last month')).toBeNull();
  });

  it('renders trend indicator when provided', () => {
    render(<StatCard {...defaultProps} trend="12%" trendUp={true} />);
    expect(screen.getByText(/12%/)).toBeInTheDocument();
    expect(screen.getByText(/↑/)).toBeInTheDocument();
  });

  it('renders downward trend indicator when trendUp is false', () => {
    render(<StatCard {...defaultProps} trend="5%" trendUp={false} />);
    expect(screen.getByText(/↓/)).toBeInTheDocument();
  });

  it('renders the icon element', () => {
    const { container } = render(<StatCard {...defaultProps} />);
    // Lucide renders as SVG
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});
