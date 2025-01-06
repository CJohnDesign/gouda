import React from 'react';
import { render, screen } from '@testing-library/react';
import { SubscriptionStatusPill } from '../SubscriptionStatusPill';

describe('SubscriptionStatusPill', () => {
  it('renders Active status correctly', () => {
    render(<SubscriptionStatusPill status="Active" />);
    const element = screen.getByText('Active');
    expect(element).toBeInTheDocument();
    expect(element).toHaveClass('inline-flex');
    expect(element).toHaveClass('items-center');
    expect(element).toHaveClass('gap-1.5');
    expect(element).toHaveClass('rounded-md');
    expect(element).toHaveClass('px-2');
    expect(element).toHaveClass('py-1');
    expect(element).toHaveClass('text-xs');
    expect(element).toHaveClass('font-medium');
    expect(element).toHaveClass('bg-green-100');
    expect(element).toHaveClass('text-green-800');
  });

  it('renders Past Due status correctly', () => {
    render(<SubscriptionStatusPill status="Past Due" />);
    const element = screen.getByText('Past Due');
    expect(element).toBeInTheDocument();
    expect(element).toHaveClass('inline-flex');
    expect(element).toHaveClass('items-center');
    expect(element).toHaveClass('gap-1.5');
    expect(element).toHaveClass('rounded-md');
    expect(element).toHaveClass('px-2');
    expect(element).toHaveClass('py-1');
    expect(element).toHaveClass('text-xs');
    expect(element).toHaveClass('font-medium');
    expect(element).toHaveClass('bg-yellow-100');
    expect(element).toHaveClass('text-yellow-800');
  });

  it('renders Canceled status correctly', () => {
    render(<SubscriptionStatusPill status="Canceled" />);
    const element = screen.getByText('Canceled');
    expect(element).toBeInTheDocument();
    expect(element).toHaveClass('inline-flex');
    expect(element).toHaveClass('items-center');
    expect(element).toHaveClass('gap-1.5');
    expect(element).toHaveClass('rounded-md');
    expect(element).toHaveClass('px-2');
    expect(element).toHaveClass('py-1');
    expect(element).toHaveClass('text-xs');
    expect(element).toHaveClass('font-medium');
    expect(element).toHaveClass('bg-red-100');
    expect(element).toHaveClass('text-red-800');
  });

  it('renders Unpaid status correctly', () => {
    render(<SubscriptionStatusPill status="Unpaid" />);
    const element = screen.getByText('Unpaid');
    expect(element).toBeInTheDocument();
    expect(element).toHaveClass('inline-flex');
    expect(element).toHaveClass('items-center');
    expect(element).toHaveClass('gap-1.5');
    expect(element).toHaveClass('rounded-md');
    expect(element).toHaveClass('px-2');
    expect(element).toHaveClass('py-1');
    expect(element).toHaveClass('text-xs');
    expect(element).toHaveClass('font-medium');
    expect(element).toHaveClass('bg-gray-100');
    expect(element).toHaveClass('text-gray-800');
  });

  it('defaults to Unknown status for unknown status values', () => {
    render(<SubscriptionStatusPill status="Unknown" />);
    const element = screen.getByText('Unknown');
    expect(element).toBeInTheDocument();
    expect(element).toHaveClass('inline-flex');
    expect(element).toHaveClass('items-center');
    expect(element).toHaveClass('gap-1.5');
    expect(element).toHaveClass('rounded-md');
    expect(element).toHaveClass('px-2');
    expect(element).toHaveClass('py-1');
    expect(element).toHaveClass('text-xs');
    expect(element).toHaveClass('font-medium');
    expect(element).toHaveClass('bg-gray-100');
    expect(element).toHaveClass('text-gray-800');
  });

  it('renders icons for each status', () => {
    const { rerender } = render(<SubscriptionStatusPill status="Active" />);
    expect(screen.getByTestId('check-circle')).toBeInTheDocument();

    rerender(<SubscriptionStatusPill status="Past Due" />);
    expect(screen.getByTestId('alert-triangle')).toBeInTheDocument();

    rerender(<SubscriptionStatusPill status="Canceled" />);
    expect(screen.getByTestId('x-circle')).toBeInTheDocument();

    rerender(<SubscriptionStatusPill status="Unpaid" />);
    expect(screen.getByTestId('alert-circle')).toBeInTheDocument();
  });
}); 