import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environments';
import { 
  DisponibilidadDocenteCreate, 
  DisponibilidadDocenteUpdate, 
  DisponibilidadDocenteResponse
} from '../models/disponibilidad.model';

@Injectable({
  providedIn: 'root'
})
export class DisponibilidadService {

  private apiUrl = `${environment.apiBaseUrl}/disponibilidad`;

  constructor(private http: HttpClient) {}

  // Genera headers con token
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    });
  }

  // Crear o actualizar disponibilidad (Docente)
  createDisponibilidad(data: DisponibilidadDocenteCreate): Observable<DisponibilidadDocenteResponse> {
    return this.http.post<DisponibilidadDocenteResponse>(
      `${this.apiUrl}/`, 
      data, 
      { headers: this.getAuthHeaders() }
    );
  }

  // Actualizar disponibilidad (Docente)
  updateDisponibilidad(id: number, data: DisponibilidadDocenteUpdate): Observable<DisponibilidadDocenteResponse> {
    return this.http.put<DisponibilidadDocenteResponse>(
      `${this.apiUrl}/${id}`, 
      data, 
      { headers: this.getAuthHeaders() }
    );
  }

  // Eliminar disponibilidad (Docente)
  deleteDisponibilidad(dia: string, modalidad: string, turno: string): Observable<any> {
    const params: any = { dia, modalidad, turno };
    return this.http.delete<any>(
      `${this.apiUrl}/`, 
      { headers: this.getAuthHeaders(), params }
    );
  }

  // Listar disponibilidades por docente (Administrador)
  getDisponibilidadesDocente(docente_id: number, modalidad?: string, turno?: string): Observable<DisponibilidadDocenteResponse[]> {
    let url = `${this.apiUrl}/docente/${docente_id}`;
    let params: any = {};
    if (modalidad) params.modalidad = modalidad;
    if (turno) params.turno = turno;

    return this.http.get<DisponibilidadDocenteResponse[]>(url, { headers: this.getAuthHeaders(), params });
  }

  // Obtener disponibilidad por ID (Administrador)
  getDisponibilidadById(id: number): Observable<DisponibilidadDocenteResponse> {
    return this.http.get<DisponibilidadDocenteResponse>(
      `${this.apiUrl}/${id}`, 
      { headers: this.getAuthHeaders() }
    );
  }

  getByDocente(docenteId: number, modalidad: string, turno: string): Observable<DisponibilidadDocenteResponse[]> {
    return this.http.get<DisponibilidadDocenteResponse[]>(
      `${this.apiUrl}/docente/${docenteId}?modalidad=${modalidad}&turno=${turno}`
    );
  }

  // Crear o actualizar disponibilidad
  createOrUpdate(payload: DisponibilidadDocenteCreate): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}`, payload);
  }
}