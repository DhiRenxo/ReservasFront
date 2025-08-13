import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environments/environments';
import {
  Asignacion,
  AsignacionCreate,
  AsignacionUpdate,
  AsignacionEstadoUpdate,
  AsignacionDelete
} from '../models/asignacion.model';
import { Observable } from 'rxjs';

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

  // Crear nueva asignación
  crear(asignacion: AsignacionCreate): Observable<Asignacion> {
    return this.http.post<Asignacion>(this.apiUrl, asignacion, {
      headers: this.getAuthHeaders()
    });
  }

  // Obtener todas las asignaciones
  listar(): Observable<Asignacion[]> {
    return this.http.get<Asignacion[]>(this.apiUrl, {
      headers: this.getAuthHeaders()
    });
  }

  // Obtener una asignación por ID
  obtener(id: number): Observable<Asignacion> {
    return this.http.get<Asignacion>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  // Actualizar asignación (update completa)
  actualizar(id: number, asignacion: AsignacionUpdate): Observable<Asignacion> {
    return this.http.put<Asignacion>(`${this.apiUrl}/${id}`, asignacion, {
      headers: this.getAuthHeaders()
    });
  }

  // Cambiar estado (habilitar/deshabilitar)
  cambiarEstado(id: number, estado: AsignacionEstadoUpdate): Observable<Asignacion> {
    return this.http.patch<Asignacion>(`${this.apiUrl}/${id}/estado`, estado, {
      headers: this.getAuthHeaders()
    });
  }

  // Actualizar solo cantidad de secciones
    actualizarCantidadSecciones(id: number, data: { cantidad_secciones: number }): Observable<Asignacion> {
      return this.http.patch<Asignacion>(
        `${this.apiUrl}/${id}/cantidad-secciones`,
        data,
        { headers: this.getAuthHeaders() }
      );
  }     

  // Eliminar (desactivar)
  eliminar(data: AsignacionDelete): Observable<{ mensaje: string }> {
    return this.http.delete<{ mensaje: string }>(this.apiUrl, {
      headers: this.getAuthHeaders(),
      body: data // DELETE con cuerpo, permitido por FastAPI
    });
  }
}
