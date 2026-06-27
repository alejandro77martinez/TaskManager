import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({
      providers: [ToastService]
    });
    service = TestBed.inject(ToastService);
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should show a toast and dismiss after duration', () => {
    service.show('info', 'Test message', 1000);
    
    expect(service.toasts().length).toBe(1);
    expect(service.toasts()[0].type).toBe('info');
    expect(service.toasts()[0].message).toBe('Test message');

    vi.advanceTimersByTime(1000);
    expect(service.toasts().length).toBe(0);
  });

  it('should show success toast', () => {
    service.success('Success!');
    
    expect(service.toasts().length).toBe(1);
    expect(service.toasts()[0].type).toBe('success');
    expect(service.toasts()[0].message).toBe('Success!');

    vi.advanceTimersByTime(4000);
    expect(service.toasts().length).toBe(0);
  });

  it('should show error toast', () => {
    service.error('Error!');
    
    expect(service.toasts().length).toBe(1);
    expect(service.toasts()[0].type).toBe('error');
    expect(service.toasts()[0].message).toBe('Error!');

    vi.advanceTimersByTime(4000);
    expect(service.toasts().length).toBe(0);
  });

  it('should show info toast', () => {
    service.info('Info!');
    
    expect(service.toasts().length).toBe(1);
    expect(service.toasts()[0].type).toBe('info');
    expect(service.toasts()[0].message).toBe('Info!');

    vi.advanceTimersByTime(4000);
    expect(service.toasts().length).toBe(0);
  });

  it('should dismiss a specific toast by id', () => {
    service.show('info', 'Message 1');
    service.show('info', 'Message 2');
    
    expect(service.toasts().length).toBe(2);
    const firstToastId = service.toasts()[0].id;
    
    service.dismiss(firstToastId);
    
    expect(service.toasts().length).toBe(1);
    expect(service.toasts()[0].id).not.toBe(firstToastId);
  });

  it('should increment toast id for each new toast', () => {
    service.show('info', 'Message 1');
    service.show('info', 'Message 2');
    service.show('info', 'Message 3');
    
    const toasts = service.toasts();
    expect(toasts[0].id).toBe(1);
    expect(toasts[1].id).toBe(2);
    expect(toasts[2].id).toBe(3);
  });

  it('should handle multiple toasts with different durations', () => {
    service.show('info', 'Short', 500);
    service.show('info', 'Long', 2000);
    
    expect(service.toasts().length).toBe(2);

    vi.advanceTimersByTime(500);
    expect(service.toasts().length).toBe(1);

    vi.advanceTimersByTime(1500);
    expect(service.toasts().length).toBe(0);
  });

  it('should use default duration of 4000ms when not specified', () => {
    service.show('info', 'Default duration');
    
    expect(service.toasts().length).toBe(1);

    vi.advanceTimersByTime(3999);
    expect(service.toasts().length).toBe(1);

    vi.advanceTimersByTime(1);
    expect(service.toasts().length).toBe(0);
  });
});
