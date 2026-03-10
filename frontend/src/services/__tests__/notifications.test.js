import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { showToast, setToastContainer } from '../notifications';

describe('notifications service', () => {
  let container;

  beforeEach(() => {
    // Create a toast container element in the DOM
    container = document.createElement('div');
    container.id = 'toastContainer';
    document.body.appendChild(container);

    // Use fake timers for duration-based tests
    vi.useFakeTimers();
  });

  afterEach(() => {
    document.body.removeChild(container);
    vi.useRealTimers();
  });

  it('creates a toast element in the container', () => {
    showToast({ title: 'Test', message: 'Hello' });

    expect(container.children.length).toBe(1);
    expect(container.querySelector('.toast')).toBeTruthy();
  });

  it('displays the correct title and message', () => {
    showToast({ title: 'Success!', message: 'Operation completed' });

    const toast = container.querySelector('.toast');
    expect(toast.querySelector('.toast-title').textContent).toBe('Success!');
    expect(toast.querySelector('.toast-message').textContent).toBe('Operation completed');
  });

  it('applies the correct type class', () => {
    showToast({ type: 'success', title: 'Done', message: 'OK' });

    const toast = container.querySelector('.toast');
    expect(toast.classList.contains('success')).toBe(true);
  });

  it('applies info type by default', () => {
    showToast({ title: 'Info', message: 'Note' });

    const toast = container.querySelector('.toast');
    expect(toast.classList.contains('info')).toBe(true);
  });

  it('shows the correct icon for each type', () => {
    showToast({ type: 'success', title: 'T', message: 'M' });
    expect(container.querySelector('.toast-icon').textContent).toBe('\u2705');

    container.innerHTML = '';
    showToast({ type: 'warning', title: 'T', message: 'M' });
    expect(container.querySelector('.toast-icon').textContent).toBe('\u26A0\uFE0F');

    container.innerHTML = '';
    showToast({ type: 'danger', title: 'T', message: 'M' });
    expect(container.querySelector('.toast-icon').textContent).toBe('\u274C');

    container.innerHTML = '';
    showToast({ type: 'info', title: 'T', message: 'M' });
    expect(container.querySelector('.toast-icon').textContent).toBe('\u2139\uFE0F');
  });

  it('includes a close button', () => {
    showToast({ title: 'Test', message: 'Close me' });

    const closeBtn = container.querySelector('.toast-close');
    expect(closeBtn).toBeTruthy();
  });

  it('includes a progress bar when duration > 0', () => {
    showToast({ title: 'T', message: 'M', duration: 3000 });

    const bar = container.querySelector('.toast-progress');
    expect(bar).toBeTruthy();
  });

  it('does not include a progress bar when duration is 0', () => {
    showToast({ title: 'T', message: 'M', duration: 0 });

    const bar = container.querySelector('.toast-progress');
    expect(bar).toBeFalsy();
  });

  it('removes the toast after duration', () => {
    showToast({ title: 'T', message: 'M', duration: 5000 });

    expect(container.children.length).toBe(1);

    // Advance past the removal timeout (duration + fadeout)
    vi.advanceTimersByTime(5300);

    expect(container.children.length).toBe(0);
  });

  it('generates unique IDs for multiple toasts', () => {
    showToast({ title: 'T1', message: 'M1' });
    showToast({ title: 'T2', message: 'M2' });

    const toasts = container.querySelectorAll('.toast');
    expect(toasts.length).toBe(2);
    expect(toasts[0].id).not.toBe(toasts[1].id);
  });

  it('uses setToastContainer to override container', () => {
    const customContainer = document.createElement('div');
    document.body.appendChild(customContainer);

    setToastContainer(customContainer);

    showToast({ title: 'Custom', message: 'Container' });

    expect(customContainer.children.length).toBe(1);
    expect(container.children.length).toBe(0);

    // Reset
    setToastContainer(null);
    document.body.removeChild(customContainer);
  });

  it('does nothing if no container exists', () => {
    document.body.removeChild(container);

    // Should not throw
    expect(() => {
      showToast({ title: 'T', message: 'M' });
    }).not.toThrow();

    // Re-add container for afterEach cleanup
    container = document.createElement('div');
    container.id = 'toastContainer';
    document.body.appendChild(container);
  });
});
