import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class AsignacionDocenteService {
  private baseUrl = `${environment.apiBaseUrl}/asignacion-docente`;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  getHorasDocente(docenteId: number): Observable<{ docente_id: number, horastemporales: number }> {
    return this.http.get<{ docente_id: number, horastemporales: number }>(
      `${this.baseUrl}/horas/${docenteId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  getHorasTodos(): Observable<any> {
    return this.http.get(`${this.baseUrl}/horas-todos`, {
      headers: this.getAuthHeaders()
    });
  }
}
