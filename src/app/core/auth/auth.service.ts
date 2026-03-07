import { computed, inject, Injectable, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { environment } from '../../../environments/environment';

interface AuthUser {
  email: string;
  provider: 'credentials' | 'google';
  roles?: string[];
  token: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly document = inject(DOCUMENT);

  private readonly tokenKey = 'auth_token';
  private readonly userKey = 'auth_user';
  private readonly apiBase = environment.authApiBaseUrl;

  private readonly tokenSignal = signal<string | null>(this.readToken());
  readonly user = signal<AuthUser | null>(this.readUser());
  readonly isAuthenticated = computed(() => !!this.tokenSignal());

  get token(): string | null {
    return this.tokenSignal();
  }

  async loginWithCredentials(email: string, password: string): Promise<boolean> {
    let response = false;
    if (!email || !password) {
      return response;
    }

    await this.loginBackend(email, password).then((user) => {
      this.persistSession(user.token, user);
      response = true;
    }).catch(() => {
     // Handle login error (e.g., show a toast message)
    });
    return response;
  }

  startGoogleLogin(): void {
    this.document.location.href = `${this.apiBase}/google/login`;
  }

  completeGoogleCallback(token: string, email: string): void {
    // In a real application, you would verify the token with the backend and fetch user details.
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

  private loginBackend(email: string, password: string): Promise<AuthUser> {
    const response = fetch(`${this.apiBase}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return response.then((res) => {
      if (!res.ok) {
        throw new Error('Login failed');
      }
      return res.json() as Promise<AuthUser>;
    });
  }
}
