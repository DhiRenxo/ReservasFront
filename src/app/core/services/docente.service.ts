import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Docente } from '../models/docente.model';
import { Observable } from 'rxjs';
import { environment } from '../environments/environments';

@Injectable({ providedIn: 'root' })
export class DocenteService {
  private baseUrl = `${environment.apiBaseUrl}/api/docentes`;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  listar(): Observable<Docente[]> {
    return this.http.get<Docente[]>(this.baseUrl, {
      headers: this.getAuthHeaders()
    });
  }

  obtener(id: number): Observable<Docente> {
    return this.http.get<Docente>(`${this.baseUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  crear(usuario: Docente): Observable<Docente> {
    return this.http.post<Docente>(this.baseUrl, usuario, {
      headers: this.getAuthHeaders()
    });
  }

  actualizar(id: number, usuario: Partial<Docente>): Observable<Docente> {
    return this.http.put<Docente>(`${this.baseUrl}/${id}`, usuario, {
      headers: this.getAuthHeaders()
    });
  }

  eliminar(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }
}