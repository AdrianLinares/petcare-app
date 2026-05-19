import { describe, expect, it } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { useQueryClient } from '@tanstack/react-query';
import { QueryProvider } from './QueryProvider';

/** Helper component that captures the QueryClient from context */
function CaptureClient({ onCapture }: { onCapture: (client: ReturnType<typeof useQueryClient>) => void }) {
  const client = useQueryClient();
  onCapture(client);
  return <div data-testid="capture">done</div>;
}

describe('QueryProvider', () => {
  it('renders children inside the provider', () => {
    render(
      <QueryProvider>
        <div data-testid="child">Hello</div>
      </QueryProvider>
    );
    expect(screen.getByTestId('child')).toHaveTextContent('Hello');
  });

  it('creates a QueryClient with staleTime 30 seconds', () => {
    let capturedClient: ReturnType<typeof useQueryClient> | null = null;

    render(
      <QueryProvider>
        <CaptureClient onCapture={(c) => { capturedClient = c; }} />
      </QueryProvider>
    );

    expect(capturedClient).not.toBeNull();
    const defaults = capturedClient!.getDefaultOptions().queries;
    expect(defaults?.staleTime).toBe(30_000);
  });

  it('creates a QueryClient with gcTime 10 minutes', () => {
    let capturedClient: ReturnType<typeof useQueryClient> | null = null;

    render(
      <QueryProvider>
        <CaptureClient onCapture={(c) => { capturedClient = c; }} />
      </QueryProvider>
    );

    expect(capturedClient).not.toBeNull();
    const defaults = capturedClient!.getDefaultOptions().queries;
    expect(defaults?.gcTime).toBe(10 * 60 * 1000);
  });

  it('creates a QueryClient with retry 2', () => {
    let capturedClient: ReturnType<typeof useQueryClient> | null = null;

    render(
      <QueryProvider>
        <CaptureClient onCapture={(c) => { capturedClient = c; }} />
      </QueryProvider>
    );

    expect(capturedClient).not.toBeNull();
    const defaults = capturedClient!.getDefaultOptions().queries;
    expect(defaults?.retry).toBe(2);
  });

  it('creates a QueryClient with refetchOnWindowFocus true', () => {
    let capturedClient: ReturnType<typeof useQueryClient> | null = null;

    render(
      <QueryProvider>
        <CaptureClient onCapture={(c) => { capturedClient = c; }} />
      </QueryProvider>
    );

    expect(capturedClient).not.toBeNull();
    const defaults = capturedClient!.getDefaultOptions().queries;
    expect(defaults?.refetchOnWindowFocus).toBe(true);
  });

  it('does not recreate QueryClient on re-render (stable via useState)', () => {
    let capturedClient: ReturnType<typeof useQueryClient> | null = null;

    const { rerender } = render(
      <QueryProvider>
        <CaptureClient onCapture={(c) => { capturedClient = c; }} />
      </QueryProvider>
    );

    const firstClient = capturedClient;

    rerender(
      <QueryProvider>
        <CaptureClient onCapture={(c) => { capturedClient = c; }} />
      </QueryProvider>
    );

    // useState initializer ensures the same instance is preserved
    expect(capturedClient).toBe(firstClient);
  });
});