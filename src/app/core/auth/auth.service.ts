import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, Subscription, catchError, interval, map, of, switchMap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthUser, LoginData } from './auth.interfaces';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly router = inject(Router);
  private readonly apiBase = environment.authApiBaseUrl;
  private readonly authUserSignal = signal<AuthUser | null>(null);
  private readonly authResolvedSignal = signal(false);
  private refreshSessionSubscription: Subscription | null = null;

  readonly authUser = this.authUserSignal.asReadonly();
  readonly authResolved = this.authResolvedSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.authUser() !== null);

  constructor(private http: HttpClient) {
  }

  login(credentials: LoginData): Observable<AuthUser> {
    return this.http.post(this.apiBase+"/api/v1/auth/login", credentials, {
      responseType: 'text',
      withCredentials: true // ✅ recibe la cookie
    }).pipe(
      catchError(this.handleError),
      // ✅ cuando el login es exitoso, encadena la petición del usuario
      switchMap(() => this.fetchCurrentUser()),
    );
  }

  fetchCurrentUser(): Observable<AuthUser> {
    return this.http.post<AuthUser>(this.apiBase+'/api/v1/auth/session', {}, {
      withCredentials: true // ✅ envía la cookie para autenticarse
    }).pipe(
      map((user) => {
        this.authUserSignal.set(user);
        this.authResolvedSignal.set(true);
        this.refreshSession();
        return user;
      }),
      catchError(this.handleError)
    );
  }

  ensureAuthState(): Observable<AuthUser | null> {
    if (this.authResolvedSignal()) {
      return of(this.authUserSignal());
    }

    return this.fetchCurrentUser().pipe(
      catchError(() => {
        this.authUserSignal.set(null);
        this.authResolvedSignal.set(true);
        return of(null);
      })
    );
  }

  logout(): void {
    this.stopRefreshSession();
    this.authUserSignal.set(null);
    this.authResolvedSignal.set(true);
    this.http.post(this.apiBase+'/api/v1/auth/logout', {}, {
      withCredentials: true,
      responseType: 'text'
    }).subscribe(
      {
        next: (response) => { 
          console.log(response)
        },
        error: (err) => {     
          console.log("Error al hacer logout: ", err)      
        }
      }
    );
  }

  private refreshSession(): void {
    if (this.refreshSessionSubscription) {
      return;
    }

    this.refreshSessionSubscription = interval(540_000).pipe(
      switchMap(() =>
        this.http.post(this.apiBase+"/api/v1/auth/refresh", null, {
          responseType: 'text',
          withCredentials: true // ✅ recibe la cookie
        }).pipe(
          catchError(this.handleError)
        )
      )
    ).subscribe({
      next: (res) => { console.log(res); },
      error: (err) => {
        this.stopRefreshSession();
        this.authUserSignal.set(null);
        this.authResolvedSignal.set(true);
      }
    });
  }

  private stopRefreshSession(): void {
    this.refreshSessionSubscription?.unsubscribe();
    this.refreshSessionSubscription = null;
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Error desconocido';
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      errorMessage = `Código: ${error.status} - Mensaje: ${error.message}`;
    }
    return throwError(() => new Error(errorMessage));
  }
}
