import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const allowedRoles = (route.data?.['roles'] as Array<'user' | 'admin'>) || [];

  if (allowedRoles.length === 0) {
    router.navigate(['/home']);
    return false;
  }

  if (authService.hasRole(allowedRoles)) {
    return true;
  }

  router.navigate(['/home']);
  return false;
};