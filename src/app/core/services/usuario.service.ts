import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Usuario } from '../models/usuario.model';
import { Observable } from 'rxjs';
import { environment } from '../environments/environments';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private baseUrl = `${environment.apiBaseUrl}/api/usuarios/`;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  listar(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.baseUrl, {
      headers: this.getAuthHeaders()
    });
  }

  obtener(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.baseUrl}${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  crear(usuario: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(this.baseUrl, usuario, {
      headers: this.getAuthHeaders()
    });
  }

  actualizar(id: number, usuario: Partial<Usuario>): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.baseUrl}${id}`, usuario, {
      headers: this.getAuthHeaders()
    });
  }

  eliminar(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  actualizarCodigoDocente(id: number, codDocente: string): Observable<Usuario> {
    const body = { cod_docente: codDocente };
    return this.http.put<Usuario>(`${this.baseUrl}${id}/cod-docente`, body, {
      headers: this.getAuthHeaders()
    });
  }

}
