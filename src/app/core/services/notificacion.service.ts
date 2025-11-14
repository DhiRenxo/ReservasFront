import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class NotificacionService {

  private baseUrl = `${environment.apiBaseUrl}/notificaciones`;

  constructor(private http: HttpClient) {}

  /** 🔐 Headers con token */
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    });
  }

  /** 📢 1. Notificación de ASIGNACIÓN */
  enviarNotificacionAsignacion(asignacionId: number): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/asignacion/${asignacionId}`,
      {},
      { headers: this.getAuthHeaders() }
    );
  }

  /** 📘 2. Confirmación de horario publicado */
  enviarConfirmacionHorario(asignacionId: number): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/confirmacion/${asignacionId}`,
      {},
      { headers: this.getAuthHeaders() }
    );
  }
}
