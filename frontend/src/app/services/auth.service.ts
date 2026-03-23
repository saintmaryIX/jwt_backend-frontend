import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  organizacion: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  accessToken: string;
  usuario: {
    _id: string;
    name: string;
    email: string;
    organizacion: string;
    role: 'user' | 'admin';
  };
}

export interface Usuario {
  _id: string;
  name: string;
  email: string;
  organizacion: any;
}

const TOKEN_KEY = 'jwt_token';
const ROLE_KEY = 'jwt_role';
const API_URL = 'http://localhost:1337';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient, private router: Router) {}

  /**
   * Registra un nuevo usuario. NO genera token.
   * Si tiene éxito, redirige a /login.
   */
  register(payload: RegisterPayload): Observable<any> {
    return this.http.post(`${API_URL}/usuarios`, payload).pipe(
      tap(() => {
        this.router.navigate(['/login']);
      })
    );
  }

  /**
   * Refresca el token actual.
   */
  refreshToken(): Observable<{ accessToken: string }> {
    return this.http.post<{ accessToken: string }>(`${API_URL}/auth/refresh`, {}, { withCredentials: true }).pipe(
      tap((res) => {
        this.saveToken(res.accessToken);
      })
    );
  }

  /**
   * Inicia sesión. Si tiene éxito, guarda el token y redirige a /home.
   */
  login(payload: LoginPayload): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${API_URL}/auth/login`, payload, { withCredentials: true }).pipe(
      tap((res) => {
        this.saveToken(res.accessToken);
        this.saveRole(res.usuario.role);
        this.router.navigate(['/home']);
      })
    );
  }

  /** Guarda el token en localStorage */
  saveToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  saveRole(role: 'user' | 'admin'): void {
    localStorage.setItem(ROLE_KEY, role);
  }

  getRole(): 'user' | 'admin' | null {
    const role = localStorage.getItem(ROLE_KEY);
    return role === 'admin' || role === 'user' ? role : null;
  }

  hasRole(allowedRoles: Array<'user' | 'admin'>): boolean {
    const role = this.getRole();
    return !!role && allowedRoles.includes(role);
  }

  /**
   * Petición protegida para probar el token (devuelve todos los usuarios).
   */
  getUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${API_URL}/usuarios`);
  }

  getAdminResource(): Observable<{ message: string; usuario: { id: string; email: string; role: string } }> {
    return this.http.get<{ message: string; usuario: { id: string; email: string; role: string } }>(`${API_URL}/usuarios/admin/resource`);
  }

  /** Obtiene el token del localStorage */
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  /** Comprueba si el usuario está autenticado */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /** Cierra sesión eliminando el token */
  logout(): void {
    this.http.post(`${API_URL}/auth/logout`, {}, { withCredentials: true }).subscribe({
      next: () => {
        // noop
      },
      error: () => {
        // noop
      }
    });

    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ROLE_KEY);
    this.router.navigate(['/login']);
  }
}
