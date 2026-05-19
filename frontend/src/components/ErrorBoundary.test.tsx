import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Component, type ReactNode } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// ----- Helpers -----

/** Component that always throws during render */
function ThrowError({ error }: { error: Error }) {
  throw error;
}

/** Normal component that renders successfully */
function WorkingComponent(): ReactNode {
  return <div data-testid="working">All good</div>;
}

// ----- Tests -----

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // Suppress console.error noise from React's error overlay in tests
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <WorkingComponent />
      </ErrorBoundary>,
    );

    expect(screen.getByTestId('working')).toBeInTheDocument();
  });

  it('catches errors from children and shows fallback UI', () => {
    const testError = new Error('Test error message');

    render(
      <ErrorBoundary>
        <ThrowError error={testError} />
      </ErrorBoundary>,
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.queryByTestId('working')).not.toBeInTheDocument();
  });

  it('logs the error via console.error', () => {
    const testError = new Error('Logged error');

    render(
      <ErrorBoundary>
        <ThrowError error={testError} />
      </ErrorBoundary>,
    );

    // React itself also logs the error, plus our componentDidCatch
    expect(console.error).toHaveBeenCalled();
  });

  it('shows error details in a collapsible section', () => {
    const testError = new Error('Visible details');

    render(
      <ErrorBoundary>
        <ThrowError error={testError} />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Error details')).toBeInTheDocument();
    expect(screen.getByText('Visible details')).toBeInTheDocument();
  });

  it('resets error state and re-renders children when retry button is clicked', () => {
    /** Component that conditionally throws based on a prop */
    class ConditionalThrow extends Component<{ shouldThrow: boolean }> {
      render(): ReactNode {
        if (this.props.shouldThrow) {
          throw new Error('Conditional error');
        }
        return <div data-testid="recovered">Recovered!</div>;
      }
    }

    // Render with shouldThrow=true → ErrorBoundary catches error, shows fallback
    const { rerender } = render(
      <ErrorBoundary>
        <ConditionalThrow shouldThrow={true} />
      </ErrorBoundary>,
    );

    // Fallback should be visible
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    // Update the prop so children won't throw anymore
    // ErrorBoundary still shows fallback because hasError=true
    rerender(
      <ErrorBoundary>
        <ConditionalThrow shouldThrow={false} />
      </ErrorBoundary>,
    );

    // Still showing fallback — now click retry to reset hasError
    fireEvent.click(screen.getByText('Try again'));

    // Children should now render successfully (shouldThrow=false)
    expect(screen.getByTestId('recovered')).toBeInTheDocument();
    expect(screen.getByText('Recovered!')).toBeInTheDocument();
  });
});