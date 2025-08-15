import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../environments/environments';
import { CursoModel } from '../models/Curso.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CursoService {
  private apiUrl = `${environment.apiBaseUrl}/cursos`;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    });
  }

  getAll(): Observable<CursoModel[]> {
    return this.http.get<CursoModel[]>(this.apiUrl, { headers: this.getAuthHeaders() });
  }

  getActivos(): Observable<CursoModel[]> {
    return this.http.get<CursoModel[]>(`${this.apiUrl}/activos`, { headers: this.getAuthHeaders() });
  }

  getById(id: number): Observable<CursoModel> {
    return this.http.get<CursoModel>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  create(curso: CursoModel): Observable<CursoModel> {
    return this.http.post<CursoModel>(this.apiUrl, curso, { headers: this.getAuthHeaders() });
  }

  update(id: number, curso: CursoModel): Observable<CursoModel> {
    return this.http.put<CursoModel>(`${this.apiUrl}/${id}`, curso, { headers: this.getAuthHeaders() });
  }

  toggleEstado(id: number): Observable<CursoModel> {
    return this.http.patch<CursoModel>(`${this.apiUrl}/${id}/cambiar-estado`, {}, { headers: this.getAuthHeaders() });
  }

  actualizarHoras(id: number, horas: number): Observable<CursoModel> {
      return this.http.patch<CursoModel>(`${this.apiUrl}/${id}/actualizar-horas/${horas}`, {}, { headers: this.getAuthHeaders() });
    }

  getByFiltro(carreraid: number, plan: string, ciclo: string, modalidad: string): Observable<CursoModel[]> {
  const params = {
    carreid: carreraid.toString(),
    plan,
    ciclo,
    modalidad
  };
  return this.http.get<CursoModel[]>(`${this.apiUrl}/filtro`, {
    headers: this.getAuthHeaders(),
    params
  });
}


}
