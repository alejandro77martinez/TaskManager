import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { signal } from '@angular/core';
import { App } from './app';
import { AuthService } from './core/auth/auth.service';
import { vi } from 'vitest';

const mockAuthService = {
  authResolved: signal(true), // por defecto ya resolvió
};

describe('App', () => {
  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService }
      ]
    });
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    fixture.detectChanges();            // ✅ inicializa el componente
    expect(app).toBeTruthy();
  });

  it('should have title "TaskManager"', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    expect(fixture.componentInstance.title).toBe('TaskManager');
  });

  it('should show router-outlet when auth is resolved', () => {
    mockAuthService.authResolved.set(true); // auth resuelta
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    vi.spyOn(router, 'currentNavigation').mockReturnValue({} as any);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('router-outlet')).toBeTruthy();
  });

  it('should show loader when auth is NOT resolved', () => {
    mockAuthService.authResolved.set(false); // auth pendiente
    const fixture = TestBed.createComponent(App);

    const router = TestBed.inject(Router);
    vi.spyOn(router, 'currentNavigation').mockReturnValue({} as any);

    fixture.detectChanges();
    expect(fixture.componentInstance.showAuthLoader()).toBe(true);
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('app-load')).toBeTruthy();
  });
    
});