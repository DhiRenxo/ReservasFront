import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GoogleLoginRequest, TokenResponse } from '../models/auth.model';
import { tap } from 'rxjs/operators';
import { environment } from '../environments/environments';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = `${environment.apiBaseUrl}/auth`; // Ajusta a tu backend

  constructor(private http: HttpClient) {}

  loginConGoogle(token: string) {
    const body: GoogleLoginRequest = { google_token: token };
    return this.http.post<TokenResponse>(`${this.baseUrl}/google-login`, body).pipe(
      tap((resp) => {
        localStorage.setItem('access_token', resp.access_token);
      })
    );
  }

  logout() {
    localStorage.removeItem('access_token');
  }
  getUserIdFromToken(): number | null {
  const token = localStorage.getItem('access_token');
  if (!token) return null;

  const payload = JSON.parse(atob(token.split('.')[1]));
  return payload.id || null;
}

}
