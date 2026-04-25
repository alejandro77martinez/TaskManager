import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SideDrawerService {
  private readonly drawerOpenSignal = signal(false);
  private readonly desktopSignal = signal(this.getDesktopState());
  private triggerElement: HTMLElement | null = null;

  readonly isOpen = this.drawerOpenSignal.asReadonly();
  readonly isDesktop = this.desktopSignal.asReadonly();

  constructor() {
    if (typeof window === 'undefined' || !('matchMedia' in window)) {
      return;
    }

    const mediaQuery = window.matchMedia('(min-width: 768px)');
    const updateDesktopState = (matches: boolean) => {
      this.desktopSignal.set(matches);

      if (matches) {
        this.drawerOpenSignal.set(false);
      }
    };

    updateDesktopState(mediaQuery.matches);
    mediaQuery.addEventListener('change', (event) => {
      updateDesktopState(event.matches);
    });
  }

  toggle(trigger?: HTMLElement | null): void {
    if (trigger) {
      this.triggerElement = trigger;
    }

    if (this.isDesktop()) {
      return;
    }

    if (this.drawerOpenSignal()) {
      this.close({ returnFocus: false });
      return;
    }

    this.drawerOpenSignal.set(true);
  }

  close(options?: { returnFocus?: boolean }): void {
    if (this.isDesktop()) {
      return;
    }

    const activeElement = typeof document !== 'undefined' ? document.activeElement : null;

    if (activeElement instanceof HTMLElement && activeElement.closest('#drawer-navigation')) {
      activeElement.blur();
    }

    this.drawerOpenSignal.set(false);

    if (options?.returnFocus === false) {
      return;
    }

    if (this.triggerElement) {
      requestAnimationFrame(() => this.triggerElement?.focus());
    }
  }

  private getDesktopState(): boolean {
    return typeof window !== 'undefined' && window.innerWidth >= 768;
  }
}
