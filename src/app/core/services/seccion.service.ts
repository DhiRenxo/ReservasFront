import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SeccionModel } from '../models/seccion.model';
import { Observable } from 'rxjs';
import { environment } from '../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class SeccionService {

  private apiUrl = `${environment.apiBaseUrl}/secciones/`;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    });
  }

  getAll(): Observable<SeccionModel[]> {
    return this.http.get<SeccionModel[]>(this.apiUrl, { headers: this.getAuthHeaders() });
  }

  getById(id: number): Observable<SeccionModel> {
    return this.http.get<SeccionModel>(`${this.apiUrl}${id}`, { headers: this.getAuthHeaders() });
  }

  create(seccion: Partial<SeccionModel>): Observable<SeccionModel> {
    return this.http.post<SeccionModel>(this.apiUrl, seccion, { headers: this.getAuthHeaders() });
  }

  update(id: number, seccion: Partial<SeccionModel>): Observable<SeccionModel> {
    return this.http.put<SeccionModel>(`${this.apiUrl}${id}`, seccion, { headers: this.getAuthHeaders() });
  }

  delete(id: number): Observable<SeccionModel> {
    return this.http.delete<SeccionModel>(`${this.apiUrl}${id}`, { headers: this.getAuthHeaders() });
  }

  cambiarEstado(id: number, estado: boolean): Observable<SeccionModel> {
    return this.http.patch<SeccionModel>(
      `${this.apiUrl}estado/${id}`,
      { estado },

      { headers: this.getAuthHeaders() }
    );
  }

  reactivarSeccion(id: number, nuevo_inicio: string, nuevo_fin: string): Observable<SeccionModel> {
    return this.http.post<SeccionModel>(
        `${this.apiUrl}reactivar/${id}?nuevo_inicio=${nuevo_inicio}&nuevo_fin=${nuevo_fin}`,
        {},
        { headers: this.getAuthHeaders() }
    );
    }
}
