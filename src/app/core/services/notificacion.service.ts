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

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    });
  }

  enviarNotificacionAsignacion(asignacionId: number): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/asignacion/${asignacionId}`,
      {},
      { headers: this.getAuthHeaders() }
    );
  }
}
