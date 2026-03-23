import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (_, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.ensureAuthState().pipe(
    map((user) => {
      if (user) {
        return true;
      }

      return router.createUrlTree(['/login'], {
        queryParams: { redirect: state.url },
      });
    })
  );
};

export const guestGuard: CanActivateFn = (_, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.ensureAuthState().pipe(
    map((user) => {
      if (user) {
        return router.createUrlTree(['/home'],{
          queryParams: { redirect: state.url },
        });
      }

      return true;
    })
  );
};
