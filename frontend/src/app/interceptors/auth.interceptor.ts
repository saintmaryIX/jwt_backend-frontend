import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';

/**
 * Interceptor funcional (Angular 17+).
 * Añade automáticamente el header Authorization: Bearer <token>
 * a todas las peticiones HTTP salientes si el usuario está autenticado.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();
  const isAuthRoute = req.url.includes('/auth/login') || req.url.includes('/auth/refresh') || req.url.includes('/auth/logout');

  const requestWithAccessToken = token && !isAuthRoute
    ? req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    })
    : req;

  return next(requestWithAccessToken).pipe(
    catchError((error) => {
      const shouldRefresh =
        error?.status === 401 &&
        !isAuthRoute &&
        !req.headers.has('x-refresh-attempt');

      if (!shouldRefresh) {
        return throwError(() => error);
      }

      return authService.refreshToken().pipe(
        switchMap(({ accessToken }) => {
          const retryRequest = req.clone({
            setHeaders: {
              Authorization: `Bearer ${accessToken}`,
              'x-refresh-attempt': 'true'
            }
          });

          return next(retryRequest);
        }),
        catchError((refreshError) => {
          authService.logout();
          return throwError(() => refreshError);
        })
      );
    })
  );
};
