import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '../alert-dialog';

// Mock Radix UI components
jest.mock('@radix-ui/react-alert-dialog', () => ({
  Root: ({ children }: { children: React.ReactNode }) => <div data-testid="alert-dialog-root">{children}</div>,
  Trigger: ({ children }: { children: React.ReactNode }) => <button data-testid="alert-dialog-trigger">{children}</button>,
  Portal: ({ children }: { children: React.ReactNode }) => <div data-testid="alert-dialog-portal">{children}</div>,
  Overlay: ({ className }: { className?: string }) => <div data-testid="alert-dialog-overlay" className={className} />,
  Content: ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div data-testid="alert-dialog-content" className={className}>{children}</div>
  ),
  Title: ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <h2 data-testid="alert-dialog-title" className={className}>{children}</h2>
  ),
  Description: ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <p data-testid="alert-dialog-description" className={className}>{children}</p>
  ),
  Action: ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <button data-testid="alert-dialog-action" className={className}>{children}</button>
  ),
  Cancel: ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <button data-testid="alert-dialog-cancel" className={className}>{children}</button>
  ),
}));

describe('AlertDialog', () => {
  const renderAlertDialog = () => {
    return render(
      <AlertDialog>
        <AlertDialogTrigger>Open Dialog</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  };

  it('renders trigger button', () => {
    renderAlertDialog();
    expect(screen.getByTestId('alert-dialog-trigger')).toBeInTheDocument();
    expect(screen.getByText('Open Dialog')).toBeInTheDocument();
  });

  it('renders dialog content', () => {
    renderAlertDialog();
    expect(screen.getByTestId('alert-dialog-content')).toBeInTheDocument();
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
    expect(screen.getByText('This action cannot be undone.')).toBeInTheDocument();
  });

  it('renders action and cancel buttons', () => {
    renderAlertDialog();
    expect(screen.getByText('Continue')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('applies custom classes to header', () => {
    render(
      <AlertDialog>
        <AlertDialogContent>
          <AlertDialogHeader className="custom-header">
            <AlertDialogTitle>Title</AlertDialogTitle>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>
    );
    expect(screen.getByText('Title').parentElement).toHaveClass('custom-header');
  });

  it('applies custom classes to footer', () => {
    render(
      <AlertDialog>
        <AlertDialogContent>
          <AlertDialogFooter className="custom-footer">
            <AlertDialogAction>Action</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
    expect(screen.getByTestId('alert-dialog-action').parentElement).toHaveClass('custom-footer');
  });

  it('applies custom classes to title', () => {
    render(
      <AlertDialog>
        <AlertDialogContent>
          <AlertDialogTitle className="custom-title">
            Custom Title
          </AlertDialogTitle>
        </AlertDialogContent>
      </AlertDialog>
    );
    expect(screen.getByTestId('alert-dialog-title')).toHaveClass('custom-title');
  });

  it('applies custom classes to description', () => {
    render(
      <AlertDialog>
        <AlertDialogContent>
          <AlertDialogDescription className="custom-description">
            Custom Description
          </AlertDialogDescription>
        </AlertDialogContent>
      </AlertDialog>
    );
    expect(screen.getByTestId('alert-dialog-description')).toHaveClass('custom-description');
  });

  it('applies custom classes to action button', () => {
    render(
      <AlertDialog>
        <AlertDialogContent>
          <AlertDialogAction className="custom-action">
            Custom Action
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    );
    expect(screen.getByTestId('alert-dialog-action')).toHaveClass('custom-action');
  });

  it('applies custom classes to cancel button', () => {
    render(
      <AlertDialog>
        <AlertDialogContent>
          <AlertDialogCancel className="custom-cancel">
            Custom Cancel
          </AlertDialogCancel>
        </AlertDialogContent>
      </AlertDialog>
    );
    expect(screen.getByTestId('alert-dialog-cancel')).toHaveClass('custom-cancel');
  });
}); 