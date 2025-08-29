import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environments';
import { 
  DisponibilidadDocente, 
  DisponibilidadDocenteCreate, 
  DisponibilidadDocenteUpdate 
} from '../models/disponibilidad.model';

@Injectable({
  providedIn: 'root'
})
export class DisponibilidadService {

  private apiUrl = `${environment.apiBaseUrl}/disponibilidad`;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    });
  }

  // ✅ Crear o actualizar disponibilidad (usa POST /disponibilidad/)
  create(data: DisponibilidadDocenteCreate): Observable<DisponibilidadDocente> {
    return this.http.post<DisponibilidadDocente>(
      this.apiUrl,
      data,
      { headers: this.getAuthHeaders() }
    );
  }

  // ✅ Listar disponibilidades de un docente con filtros opcionales
  getByDocente(docenteId: number, modalidad?: string, turno?: string): Observable<DisponibilidadDocente[]> {
    let url = `${this.apiUrl}/docente/${docenteId}`;
    const params: string[] = [];
    if (modalidad) params.push(`modalidad=${encodeURIComponent(modalidad)}`);
    if (turno) params.push(`turno=${encodeURIComponent(turno)}`);
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }
    return this.http.get<DisponibilidadDocente[]>(url, { headers: this.getAuthHeaders() });
  }

  // ✅ Obtener disponibilidad por ID
  getById(id: number): Observable<DisponibilidadDocente> {
    return this.http.get<DisponibilidadDocente>(
      `${this.apiUrl}/${id}`,
      { headers: this.getAuthHeaders() }
    );
  }

  // ✅ Actualizar disponibilidad individual
  update(id: number, data: DisponibilidadDocenteUpdate): Observable<DisponibilidadDocente> {
    return this.http.put<DisponibilidadDocente>(
      `${this.apiUrl}/${id}`,
      data,
      { headers: this.getAuthHeaders() }
    );
  }

  // ✅ Upsert en lote de disponibilidades (requiere docenteId + modalidad + turno)
  upsertByDocente(docenteId: number, modalidad: string, turno: string, data: DisponibilidadDocenteUpdate[]): Observable<DisponibilidadDocente[]> {
    return this.http.put<DisponibilidadDocente[]>(
      `${this.apiUrl}/docente/${docenteId}/${encodeURIComponent(modalidad)}/${encodeURIComponent(turno)}`,
      data,
      { headers: this.getAuthHeaders() }
    );
  }

  // ✅ Eliminar disponibilidad (docente_id + modalidad + turno + dia como query params)
  delete(docenteId: number, modalidad: string, turno: string, dia: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.apiUrl}?docente_id=${docenteId}&modalidad=${encodeURIComponent(modalidad)}&turno=${encodeURIComponent(turno)}&dia=${encodeURIComponent(dia)}`,
      { headers: this.getAuthHeaders() }
    );
  }
}
