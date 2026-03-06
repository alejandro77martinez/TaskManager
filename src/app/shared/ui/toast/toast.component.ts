import { Component, inject } from '@angular/core';
import { ToastMessage, ToastService } from '../../../core/toast/toast.service';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
})
export class ToastComponent {
  private readonly toastService = inject(ToastService);
  readonly toasts = this.toastService.toasts;

  dismiss(id: number): void {
    this.toastService.dismiss(id);
  }

  iconContainerClasses(toast: ToastMessage): string {
    if (toast.type === 'success') {
      return 'inline-flex items-center justify-center shrink-0 w-7 h-7 text-green-200 bg-green-800 rounded';
    }

    if (toast.type === 'error') {
      return 'inline-flex items-center justify-center shrink-0 w-7 h-7 text-red-200 bg-red-800 rounded';
    }

    return 'inline-flex items-center justify-center shrink-0 w-7 h-7 text-blue-200 bg-blue-800 rounded';
  }

  iconPath(toast: ToastMessage): string {
    if (toast.type === 'success') {
      return 'M5 11.917 9.724 16.5 19 7.5';
    }

    if (toast.type === 'error') {
      return 'M6 18 17.94 6M18 18 6.06 6';
    }

    return 'M12 13V8m0 8h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z';
  }
}
