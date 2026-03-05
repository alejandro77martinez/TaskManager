import { computed, inject, Injectable, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';

interface AuthUser {
  email: string;
  provider: 'credentials' | 'google';
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly document = inject(DOCUMENT);

  private readonly tokenKey = 'auth_token';
  private readonly userKey = 'auth_user';
  private readonly apiBase = '/api/auth';

  private readonly tokenSignal = signal<string | null>(this.readToken());
  readonly user = signal<AuthUser | null>(this.readUser());
  readonly isAuthenticated = computed(() => !!this.tokenSignal());

  get token(): string | null {
    return this.tokenSignal();
  }

  loginWithCredentials(email: string, password: string): boolean {
    if (!email || !password) {
      return false;
    }

    // Demo token. Replace with backend JWT response.
    const fakeJwt = this.createDemoJwt(email);
    this.persistSession(fakeJwt, { email, provider: 'credentials' });
    return true;
  }

  startGoogleLogin(): void {
    this.document.location.href = `${this.apiBase}/google/login`;
  }

  completeGoogleCallback(token: string, email: string): void {
    this.persistSession(token, { email, provider: 'google' });
  }

  logout(): void {
    this.tokenSignal.set(null);
    this.user.set(null);
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  private persistSession(token: string, user: AuthUser): void {
    this.tokenSignal.set(token);
    this.user.set(user);
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  private readToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private readUser(): AuthUser | null {
    const stored = localStorage.getItem(this.userKey);
    if (!stored) {
      return null;
    }

    try {
      return JSON.parse(stored) as AuthUser;
    } catch {
      return null;
    }
  }

  private createDemoJwt(email: string): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(
      JSON.stringify({
        sub: email,
        iat: Math.floor(Date.now() / 1000),
      }),
    );
    return `${header}.${payload}.demo-signature`;
  }
}
