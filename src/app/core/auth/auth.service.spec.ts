import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { vi } from 'vitest';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';
import { AuthUser, LoginData } from './auth.interfaces';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let routerSpy: { navigateByUrl: ReturnType<typeof vi.fn> };

  // Mock data
  const mockLoginData: LoginData = {
    email: 'test@example.com',
    password: 'password123'
  };

  const mockAuthUser: AuthUser = {
    id: '1',
    email: 'test@example.com',
    name: 'Test',
    lastName: 'User',
    avatar: null,
    roles: ['user']
  };

  beforeEach(() => {
    // Mock Router
    routerSpy = {
      navigateByUrl: vi.fn().mockResolvedValue(true)
    };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClientTesting(),
        AuthService,
        { provide: Router, useValue: routerSpy }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Verificar que no hay peticiones HTTP pendientes
    httpMock.verify();
    vi.clearAllMocks();
  });

  describe('Inicialización', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should have undefined authUser initially', () => {
      expect(service.authUser()).toBeNull();
    });

    it('should have authResolved as false initially', () => {
      expect(service.authResolved()).toBe(false);
    });

    it('should have isAuthenticated as false initially', () => {
      expect(service.isAuthenticated()).toBe(false);
    });
  });

  describe('Login', () => {
    it('should successfully login and fetch user', async () => {
      let result: AuthUser | undefined;

      service.login(mockLoginData).subscribe({
        next: (user) => {
          result = user;
        }
      });

      // Mock la respuesta del login (texto vacío)
      const loginReq = httpMock.expectOne(
        environment.authApiBaseUrl + '/api/v1/auth/login'
      );
      expect(loginReq.request.method).toBe('POST');
      expect(loginReq.request.withCredentials).toBe(true);
      loginReq.flush('');

      // Mock la respuesta de fetchCurrentUser
      const sessionReq = httpMock.expectOne(
        environment.authApiBaseUrl + '/api/v1/auth/session'
      );
      expect(sessionReq.request.method).toBe('POST');
      expect(sessionReq.request.withCredentials).toBe(true);
      sessionReq.flush(mockAuthUser);

      // Esperar a que se procese la suscripción
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(result).toEqual(mockAuthUser);
      expect(service.authUser()).toEqual(mockAuthUser);
      expect(service.authResolved()).toBe(true);
    });

    it('should handle login error', async () => {
      let error: any;

      service.login(mockLoginData).subscribe({
        next: () => {
          throw new Error('Should have failed');
        },
        error: (err) => {
          error = err;
        }
      });

      const loginReq = httpMock.expectOne(
        environment.authApiBaseUrl + '/api/v1/auth/login'
      );
      loginReq.error(
        new ProgressEvent('Network error'),
        { status: 401, statusText: 'Unauthorized' }
      );

      await new Promise(resolve => setTimeout(resolve, 50));
      expect(error.message).toContain('Código: 401');
    });

    it('should send credentials with withCredentials flag', () => {
      service.login(mockLoginData).subscribe();

      const loginReq = httpMock.expectOne(
        environment.authApiBaseUrl + '/api/v1/auth/login'
      );
      expect(loginReq.request.withCredentials).toBe(true);
      loginReq.flush('');

      httpMock.expectOne(environment.authApiBaseUrl + '/api/v1/auth/session').flush(mockAuthUser);
    });
  });

  describe('FetchCurrentUser', () => {
    it('should fetch and set current user', async () => {
      let result: AuthUser | undefined;

      service.fetchCurrentUser().subscribe({
        next: (user) => {
          result = user;
        },
        error: () => {
          throw new Error('Should not fail');
        }
      });

      const req = httpMock.expectOne(
        environment.authApiBaseUrl + '/api/v1/auth/session'
      );
      expect(req.request.method).toBe('POST');
      expect(req.request.withCredentials).toBe(true);
      req.flush(mockAuthUser);

      await new Promise(resolve => setTimeout(resolve, 50));

      expect(result).toEqual(mockAuthUser);
      expect(service.authUser()).toEqual(mockAuthUser);
      expect(service.authResolved()).toBe(true);
    });

    it('should handle fetchCurrentUser error', async () => {
      let error: any;

      service.fetchCurrentUser().subscribe({
        next: () => {
          throw new Error('Should have failed');
        },
        error: (err) => {
          error = err;
        }
      });

      const req = httpMock.expectOne(
        environment.authApiBaseUrl + '/api/v1/auth/session'
      );
      req.error(
        new ProgressEvent('Network error'),
        { status: 500, statusText: 'Internal Server Error' }
      );

      await new Promise(resolve => setTimeout(resolve, 50));
      expect(error.message).toContain('Error');
    });

    it('should start refresh session after fetching user', async () => {
      service.fetchCurrentUser().subscribe();

      const req = httpMock.expectOne(
        environment.authApiBaseUrl + '/api/v1/auth/session'
      );
      req.flush(mockAuthUser);

      // Esperar a que se inicie el refresh
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(service.authUser()).toEqual(mockAuthUser);
    });
  });

  describe('EnsureAuthState', () => {
    it('should return authUser if already resolved', async () => {
      // Establecer el estado autenticado primero
      service.fetchCurrentUser().subscribe();
      
      let fetchReq = httpMock.expectOne(
        environment.authApiBaseUrl + '/api/v1/auth/session'
      );
      fetchReq.flush(mockAuthUser);

      await new Promise(resolve => setTimeout(resolve, 50));

      // Ahora llamar ensureAuthState
      let result: AuthUser | null | undefined;
      service.ensureAuthState().subscribe({
        next: (user) => {
          result = user;
        }
      });

      await new Promise(resolve => setTimeout(resolve, 50));

      expect(result).toEqual(mockAuthUser);
      // No debe hacer otra petición HTTP
      expect(() => httpMock.expectOne(
        environment.authApiBaseUrl + '/api/v1/auth/session'
      )).toThrow();
    });

    it('should fetch user if not resolved yet', async () => {
      let result: AuthUser | null | undefined;

      service.ensureAuthState().subscribe({
        next: (user) => {
          result = user;
        }
      });

      const req = httpMock.expectOne(
        environment.authApiBaseUrl + '/api/v1/auth/session'
      );
      req.flush(mockAuthUser);

      await new Promise(resolve => setTimeout(resolve, 50));

      expect(result).toEqual(mockAuthUser);
      expect(service.authResolved()).toBe(true);
    });

    it('should handle ensureAuthState error gracefully', async () => {
      let result: AuthUser | null | undefined;

      service.ensureAuthState().subscribe({
        next: (user) => {
          result = user;
        }
      });

      const req = httpMock.expectOne(
        environment.authApiBaseUrl + '/api/v1/auth/session'
      );
      req.error(
        new ProgressEvent('Network error'),
        { status: 401, statusText: 'Unauthorized' }
      );

      await new Promise(resolve => setTimeout(resolve, 50));

      expect(result).toBeNull();
      expect(service.authUser()).toBeNull();
      expect(service.authResolved()).toBe(true);
    });
  });

  describe('Logout', () => {
    it('should clear auth state on logout', async () => {
      // Primero establecer el usuario autenticado
      service.fetchCurrentUser().subscribe();
      
      const fetchReq = httpMock.expectOne(
        environment.authApiBaseUrl + '/api/v1/auth/session'
      );
      fetchReq.flush(mockAuthUser);

      await new Promise(resolve => setTimeout(resolve, 50));

      // Ahora hacer logout
      service.logout();

      const logoutReq = httpMock.expectOne(
        environment.authApiBaseUrl + '/api/v1/auth/logout'
      );
      expect(logoutReq.request.method).toBe('POST');
      expect(logoutReq.request.withCredentials).toBe(true);
      logoutReq.flush('');

      // Verificar que el estado se limpió
      expect(service.authUser()).toBeNull();
      expect(service.authResolved()).toBe(true);
      expect(service.isAuthenticated()).toBe(false);
    });

    it('should send logout request with credentials', () => {
      service.logout();

      const logoutReq = httpMock.expectOne(
        environment.authApiBaseUrl + '/api/v1/auth/logout'
      );
      expect(logoutReq.request.withCredentials).toBe(true);
      logoutReq.flush('');
    });

    it('should stop refresh session on logout', async () => {
      // Establecer usuario y comenzar refresh
      service.fetchCurrentUser().subscribe();

      const fetchReq = httpMock.expectOne(
        environment.authApiBaseUrl + '/api/v1/auth/session'
      );
      fetchReq.flush(mockAuthUser);

      await new Promise(resolve => setTimeout(resolve, 50));

      service.logout();

      const logoutReq = httpMock.expectOne(
        environment.authApiBaseUrl + '/api/v1/auth/logout'
      );
      logoutReq.flush('');

      // Esperar a verificar que no hay más peticiones
      await new Promise(resolve => setTimeout(resolve, 100));
      httpMock.verify();
    });
  });

  describe('Signals and Computed', () => {
    it('should have isAuthenticated computed value that updates with authUser', () => {
      expect(service.isAuthenticated()).toBe(false);

      service.fetchCurrentUser().subscribe();
      const req = httpMock.expectOne(
        environment.authApiBaseUrl + '/api/v1/auth/session'
      );
      req.flush(mockAuthUser);

      expect(service.isAuthenticated()).toBe(true);
    });

    it('should update authResolved signal correctly', () => {
      expect(service.authResolved()).toBe(false);

      service.fetchCurrentUser().subscribe();
      const req = httpMock.expectOne(
        environment.authApiBaseUrl + '/api/v1/auth/session'
      );
      req.flush(mockAuthUser);

      expect(service.authResolved()).toBe(true);
    });

    it('should have readonly signals that cannot be mutated externally', () => {
      // Los signals son readonly, por lo que no debería haber métodos set accesibles
      expect(() => {
        (service.authUser as any).set(mockAuthUser);
      }).toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should handle server error correctly', async () => {
      let error: any;

      service.login(mockLoginData).subscribe({
        next: () => {
          throw new Error('Should have failed');
        },
        error: (err) => {
          error = err;
        }
      });

      const loginReq = httpMock.expectOne(
        environment.authApiBaseUrl + '/api/v1/auth/login'
      );
      loginReq.error(
        new ProgressEvent('Server error'),
        { status: 500, statusText: 'Internal Server Error' }
      );

      await new Promise(resolve => setTimeout(resolve, 50));
      expect(error.message).toContain('Código: 500');
    });

    it('should handle 401 unauthorized on login', async () => {
      let error: any;

      service.login(mockLoginData).subscribe({
        next: () => {
          throw new Error('Should have failed');
        },
        error: (err) => {
          error = err;
        }
      });

      const loginReq = httpMock.expectOne(
        environment.authApiBaseUrl + '/api/v1/auth/login'
      );
      loginReq.error(
        new ProgressEvent('Invalid credentials'),
        { status: 401, statusText: 'Unauthorized' }
      );

      await new Promise(resolve => setTimeout(resolve, 50));
      expect(error.message).toContain('Código: 401');
      expect(service.isAuthenticated()).toBe(false);
    });
  });

  describe('HTTP Requests Configuration', () => {
    it('should use correct API base URL from environment', () => {
      service.login(mockLoginData).subscribe();

      const loginReq = httpMock.expectOne((req) => {
        return req.url.includes(environment.authApiBaseUrl);
      });
      expect(loginReq.request.url).toContain(environment.authApiBaseUrl);
      loginReq.flush('');

      httpMock.expectOne(
        environment.authApiBaseUrl + '/api/v1/auth/session'
      ).flush(mockAuthUser);
    });

    it('should use POST method for all auth endpoints', () => {
      service.login(mockLoginData).subscribe();

      const loginReq = httpMock.expectOne(
        environment.authApiBaseUrl + '/api/v1/auth/login'
      );
      expect(loginReq.request.method).toBe('POST');
      loginReq.flush('');

      const sessionReq = httpMock.expectOne(
        environment.authApiBaseUrl + '/api/v1/auth/session'
      );
      expect(sessionReq.request.method).toBe('POST');
      sessionReq.flush(mockAuthUser);
    });

    it('should send login request with credentials payload', () => {
      service.login(mockLoginData).subscribe();

      const loginReq = httpMock.expectOne(
        environment.authApiBaseUrl + '/api/v1/auth/login'
      );
      expect(loginReq.request.body).toEqual(mockLoginData);
      loginReq.flush('');

      httpMock.expectOne(
        environment.authApiBaseUrl + '/api/v1/auth/session'
      ).flush(mockAuthUser);
    });
  });

  describe('Session Refresh', () => {
    it('should not start multiple refresh subscriptions', async () => {
      service.fetchCurrentUser().subscribe();
      
      const req1 = httpMock.expectOne(
        environment.authApiBaseUrl + '/api/v1/auth/session'
      );
      req1.flush(mockAuthUser);

      await new Promise(resolve => setTimeout(resolve, 50));

      // Llamar fetchCurrentUser nuevamente
      service.fetchCurrentUser().subscribe();
      
      const req2 = httpMock.expectOne(
        environment.authApiBaseUrl + '/api/v1/auth/session'
      );
      req2.flush(mockAuthUser);

      // Debería haber solo una subscripción de refresh
      // Verificar que no hay peticiones extra pendientes
      await new Promise(resolve => setTimeout(resolve, 100));
      httpMock.verify();
    });
  });
});
