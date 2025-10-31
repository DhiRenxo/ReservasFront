import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environments';
import {
  AsignacionCreate,
  AsignacionResponse,
  AsignacionUpdate,
  AsignacionUpdateSecciones,
  AsignacionUpdateEstado,
  AsignacionCursoDocenteCreate,
  AsignacionCursoDocenteResponse,
  CursosUpdate,
  DocenteUpdate,
  AsignacionCursoDocenteComentarioUpdate,
  AsignacionCursoDocenteUpdate,
  CursosAsignadosDocenteResponse
} from '../models/asignacion.model';

@Injectable({
  providedIn: 'root'
})
export class AsignacionService {
  private apiUrl = `${environment.apiBaseUrl}/asignaciones`;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    });
  }

  create(asignacion: AsignacionCreate): Observable<AsignacionResponse> {
    return this.http.post<AsignacionResponse>(`${this.apiUrl}/`, asignacion, {
      headers: this.getAuthHeaders()
    });
  }

  getAll(skip = 0, limit = 100): Observable<AsignacionResponse[]> {
    return this.http.get<AsignacionResponse[]>(`${this.apiUrl}/?skip=${skip}&limit=${limit}`, {
      headers: this.getAuthHeaders()
    });
  }

  getById(id: number): Observable<AsignacionResponse> {
    return this.http.get<AsignacionResponse>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  update(id: number, asignacion: AsignacionUpdate): Observable<AsignacionResponse> {
    return this.http.put<AsignacionResponse>(`${this.apiUrl}/${id}`, asignacion, {
      headers: this.getAuthHeaders()
    });
  }

  updateSecciones(id: number, update: AsignacionUpdateSecciones): Observable<AsignacionResponse> {
    return this.http.patch<AsignacionResponse>(`${this.apiUrl}/${id}/secciones`, update, {
      headers: this.getAuthHeaders()
    });
  }

  updateEstado(id: number, data: AsignacionUpdateEstado): Observable<AsignacionResponse> {
    return this.http.patch<AsignacionResponse>(`${this.apiUrl}/${id}/estado`, data, {
      headers: this.getAuthHeaders()
    });
  }

  delete(id: number): Observable<AsignacionResponse> {
    return this.http.delete<AsignacionResponse>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  addRelacion(relacion: AsignacionCursoDocenteCreate): Observable<AsignacionCursoDocenteResponse> {
    return this.http.post<AsignacionCursoDocenteResponse>(`${this.apiUrl}/relacion`, relacion, {
      headers: this.getAuthHeaders()
    });
  }

  getRelaciones(asignacionId: number): Observable<AsignacionCursoDocenteResponse[]> {
    return this.http.get<AsignacionCursoDocenteResponse[]>(`${this.apiUrl}/${asignacionId}/relaciones`, {
      headers: this.getAuthHeaders()
    });
  }

  actualizarCursos(asignacionId: number, cursos: CursosUpdate): Observable<AsignacionCursoDocenteResponse[]> {
    return this.http.patch<AsignacionCursoDocenteResponse[]>(
      `${this.apiUrl}/${asignacionId}/cursos`,
      cursos,
      { headers: this.getAuthHeaders() }
    );
  }

  actualizarDocenteCurso(asignacionId: number, data: DocenteUpdate): Observable<AsignacionCursoDocenteResponse> {
    return this.http.patch<AsignacionCursoDocenteResponse>(
      `${this.apiUrl}/${asignacionId}/relaciones/docente`,
      data,
      { headers: this.getAuthHeaders() }
    );
  }

  deleteSeccion(asignacionId: number, seccion: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${asignacionId}/secciones/${seccion}`, {
      headers: this.getAuthHeaders()
    });
  }

  /** 🔹 Recalcular horas de un docente */
  recalcularHorasDocente(docenteId: number): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrl}/recalcular/${docenteId}`,
      {},
      { headers: this.getAuthHeaders() }
    );
  }

   actualizarRelacion(
    relacionId: number,
    data: AsignacionCursoDocenteUpdate
  ): Observable<AsignacionCursoDocenteResponse> {
    return this.http.patch<AsignacionCursoDocenteResponse>(
      `${this.apiUrl}/relaciones/${relacionId}`,
      data,
      { headers: this.getAuthHeaders() }
    );
  }


  activarBloque(
    relacionId: number,
    bloque: 'A' | 'B'
  ): Observable<AsignacionCursoDocenteResponse> {
    return this.http.patch<AsignacionCursoDocenteResponse>(
      `${this.apiUrl}/relaciones/${relacionId}/activar`,
      { bloque },
      { headers: this.getAuthHeaders() }
    );
  }

  actualizarComentarioDisponibilidad(
    relacionId: number,
    data: AsignacionCursoDocenteComentarioUpdate
  ): Observable<AsignacionCursoDocenteResponse> {
    return this.http.patch<AsignacionCursoDocenteResponse>(
      `${this.apiUrl}/relaciones/${relacionId}/comentario`,
      data,
      { headers: this.getAuthHeaders() }
    );
  }


  desactivarBloque(relacionId: number) {
    return this.http.put<any>(`${this.apiUrl}/relaciones/${relacionId}/desactivar-bloque`, {});
  }

  
    obtenerCursosDocente(correo: string): Observable<CursosAsignadosDocenteResponse[]> {
      return this.http.get<CursosAsignadosDocenteResponse[]>(
        `${this.apiUrl}/docente/${correo}`,
        { headers: this.getAuthHeaders() }
      );
    }


}
