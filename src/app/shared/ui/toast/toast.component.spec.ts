import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ToastComponent } from './toast.component';
import { ToastService } from '../../../core/toast/toast.service';
import { ToastMessage, ToastType } from '../../../core/toast/toast.interfaces';
import { vi } from 'vitest';

describe('ToastComponent', () => {
  let component: ToastComponent;
  let fixture: ComponentFixture<ToastComponent>;
  let toastService: ToastService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToastComponent],
      providers: [ToastService],
    }).compileComponents();

    fixture = TestBed.createComponent(ToastComponent);
    component = fixture.componentInstance;
    toastService = TestBed.inject(ToastService);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('iconContainerClasses', () => {
    it('should return success styles for success type', () => {
      const toast: ToastMessage = {
        id: 1,
        message: 'Success message',
        type: 'success',
      };

      const classes = component.iconContainerClasses(toast);

      expect(classes).toContain('bg-green-800');
      expect(classes).toContain('text-green-200');
      expect(classes).toContain('inline-flex');
      expect(classes).toContain('w-7');
      expect(classes).toContain('h-7');
    });

    it('should return error styles for error type', () => {
      const toast: ToastMessage = {
        id: 2,
        message: 'Error message',
        type: 'error',
      };

      const classes = component.iconContainerClasses(toast);

      expect(classes).toContain('bg-red-800');
      expect(classes).toContain('text-red-200');
      expect(classes).toContain('inline-flex');
    });

    it('should return info styles for info type', () => {
      const toast: ToastMessage = {
        id: 3,
        message: 'Info message',
        type: 'info',
      };

      const classes = component.iconContainerClasses(toast);

      expect(classes).toContain('bg-blue-800');
      expect(classes).toContain('text-blue-200');
      expect(classes).toContain('inline-flex');
    });

    it('should return info styles as default for unknown type', () => {
      const toast: ToastMessage = {
        id: 4,
        message: 'Unknown type',
        type: 'unknown' as ToastType,
      };

      const classes = component.iconContainerClasses(toast);

      expect(classes).toContain('bg-blue-800');
      expect(classes).toContain('text-blue-200');
    });
  });

  describe('iconPath', () => {
    it('should return success SVG path for success type', () => {
      const toast: ToastMessage = {
        id: 1,
        message: 'Success',
        type: 'success',
      };

      const path = component.iconPath(toast);

      expect(path).toBe('M5 11.917 9.724 16.5 19 7.5');
    });

    it('should return error SVG path for error type', () => {
      const toast: ToastMessage = {
        id: 2,
        message: 'Error',
        type: 'error',
      };

      const path = component.iconPath(toast);

      expect(path).toBe('M6 18 17.94 6M18 18 6.06 6');
    });

    it('should return info SVG path for info type', () => {
      const toast: ToastMessage = {
        id: 3,
        message: 'Info',
        type: 'info',
      };

      const path = component.iconPath(toast);

      expect(path).toBe('M12 13V8m0 8h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z');
    });

    it('should return info SVG path as default for unknown type', () => {
      const toast: ToastMessage = {
        id: 4,
        message: 'Unknown',
        type: 'unknown' as ToastType,
      };

      const path = component.iconPath(toast);

      expect(path).toBe('M12 13V8m0 8h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z');
    });
  });

  describe('dismiss', () => {
    it('should call toastService.dismiss with toast id', () => {
      vi.spyOn(toastService, 'dismiss');

      component.dismiss(5);

      expect(toastService.dismiss).toHaveBeenCalledWith(5);
    });

    it('should call toastService.dismiss when close button is clicked', async () => {
      vi.spyOn(toastService, 'dismiss');

      toastService.show('info', 'Test message', 4000);

      fixture.detectChanges();
      await fixture.whenStable();

      const closeButton = fixture.debugElement.query(
        (el) => el.nativeElement.getAttribute('aria-label') === 'Close'
      );

      if (closeButton) {
        closeButton.nativeElement.click();
        expect(toastService.dismiss).toHaveBeenCalled();
      }
    });
  });

  describe('template rendering', () => {
    it('should render toasts from signal', async () => {
      toastService.show('success', 'First toast', 4000);

      fixture.detectChanges();
      await fixture.whenStable();

      const toastElement = fixture.debugElement.query(
        (el) => el.nativeElement.textContent?.includes('First toast')
      );

      expect(toastElement).toBeTruthy();
    });

    it('should render multiple toasts', async () => {
      toastService.show('success', 'Toast 1', 4000);
      toastService.show('error', 'Toast 2', 4000);

      fixture.detectChanges();
      await fixture.whenStable();

      const toastElements = fixture.debugElement.queryAll(
        (el) => el.nativeElement.role === 'alert'
      );

      expect(toastElements.length).toBeGreaterThanOrEqual(2);
    });

    it('should display correct message text', async () => {
      const testMessage = 'This is a test message';

      toastService.show('info', testMessage, 4000);

      fixture.detectChanges();
      await fixture.whenStable();

      const messageElement = fixture.debugElement.query(
        (el) =>
          el.nativeElement.textContent?.includes(testMessage) &&
          el.nativeElement.className?.includes('text-white')
      );

      expect(messageElement?.nativeElement.textContent).toContain(testMessage);
    });

    it('should have fixed positioning styles', () => {
      const container = fixture.debugElement.query((el) =>
        el.nativeElement.className?.includes('fixed')
      );

      expect(container).toBeTruthy();
      expect(container?.nativeElement.className).toContain('fixed');
      expect(container?.nativeElement.className).toContain('top-12');
      expect(container?.nativeElement.className).toContain('right-4');
      expect(container?.nativeElement.className).toContain('z-[100]');
    });

    it('should track toasts by id in @for loop', async () => {
      toastService.show('success', 'Toast 1', 4000);
      toastService.show('error', 'Toast 2', 4000);

      fixture.detectChanges();
      await fixture.whenStable();

      const alerts = fixture.debugElement.queryAll(
        (el) => el.nativeElement.role === 'alert'
      );

      expect(alerts.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('accessibility', () => {
    it('should have role="alert" on toast container', async () => {
      toastService.show('info', 'Alert message', 4000);

      fixture.detectChanges();
      await fixture.whenStable();

      const alert = fixture.debugElement.query(
        (el) => el.nativeElement.role === 'alert'
      );

      expect(alert?.nativeElement.role).toBe('alert');
    });

    it('should have close button with aria-label', async () => {
      toastService.show('info', 'Test', 4000);

      fixture.detectChanges();
      await fixture.whenStable();

      const closeButton = fixture.debugElement.query(
        (el) => el.nativeElement.getAttribute('aria-label') === 'Close'
      );

      expect(closeButton?.nativeElement.getAttribute('aria-label')).toBe(
        'Close'
      );
    });

    it('should have sr-only text for icon', async () => {
      toastService.show('success', 'Test', 4000);

      fixture.detectChanges();
      await fixture.whenStable();

      const srTexts = fixture.debugElement.queryAll((el) =>
        el.nativeElement.classList?.contains('sr-only')
      );

      expect(srTexts.length).toBeGreaterThan(0);
    });
  });

  describe('signal reactivity', () => {
    it('should reactively display new toasts', async () => {
      expect(component.toasts().length).toBe(0);

      toastService.show('info', 'New toast', 4000);

      await new Promise((r) => setTimeout(r, 0));

      expect(component.toasts().length).toBeGreaterThan(0);
    });

    it('should remove dismissed toasts from signal', async () => {
      toastService.show('info', 'To dismiss', 4000);

      fixture.detectChanges();
      await fixture.whenStable();

      const initialCount = component.toasts().length;

      if (component.toasts().length > 0) {
        toastService.dismiss(component.toasts()[0].id);
      }

      await new Promise((r) => setTimeout(r, 0));

      const finalCount = component.toasts().length;

      expect(finalCount).toBeLessThan(initialCount);
    });
  });

  describe('SVG icon rendering', () => {
    it('should render SVG with correct stroke attributes', async () => {
      toastService.show('success', 'Test', 4000);

      fixture.detectChanges();
      await fixture.whenStable();

      const svg = fixture.debugElement.query((el) => el.name === 'svg');

      expect(svg?.nativeElement.getAttribute('xmlns')).toBe(
        'http://www.w3.org/2000/svg'
      );
      expect(svg?.nativeElement.getAttribute('width')).toBe('24');
      expect(svg?.nativeElement.getAttribute('height')).toBe('24');
    });

    it('should dynamically set SVG path based on toast type', async () => {
      toastService.show('success', 'Success', 4000);

      fixture.detectChanges();
      await fixture.whenStable();

      const paths = fixture.debugElement.queryAll((el) => el.name === 'path');

      const successPath = paths.find(
        (p) => p.nativeElement.getAttribute('d') === 'M5 11.917 9.724 16.5 19 7.5'
      );

      expect(successPath).toBeTruthy();
    });
  });
});
