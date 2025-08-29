import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GoogleLoginRequest } from '../models/auth.model';
import { tap } from 'rxjs/operators';
import { environment } from '../environments/environments';
import { Usuario } from '../models/usuario.model';

export interface AuthResponse {
  access_token: string;
  usuario: Usuario;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = `${environment.apiBaseUrl}/auth`;

  constructor(private http: HttpClient) {}

  /**
   * Login con Google
   */
  loginConGoogle(token: string) {
    const body: GoogleLoginRequest = { google_token: token };
    return this.http.post<AuthResponse>(`${this.baseUrl}/google-login`, body).pipe(
      tap((resp) => {
        if (resp.access_token) {
          localStorage.setItem('access_token', resp.access_token);
        }

        if (resp.usuario?.id) {
          localStorage.setItem('usuario_id', resp.usuario.id.toString());
        }
      })
    );
  }

  /**
   * Cierra la sesión del usuario
   */
  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('usuario_id');
  }

  /**
   * Obtiene el token actual
   */
  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  /**
   * Verifica si el usuario está logueado
   */
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  /**
   * Extrae el userId del token JWT
   */
  getUserIdFromToken(): number | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.id || null;
    } catch (e) {
      console.error('Error decodificando el token', e);
      return null;
    }
  }

  /**
   * Decodifica el payload del JWT
   */
  getDecodedToken(): any | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      console.error('Error decodificando token', e);
      return null;
    }
  }
}
