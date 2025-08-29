import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Rol, RolCreate, RolUpdate } from '../models/rol.model'; 
import { environment } from '../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class RolService {
  private apiUrl = `${environment.apiBaseUrl}/api/roles`; 

  constructor(private http: HttpClient) {}

  getAll(): Observable<Rol[]> {
    return this.http.get<Rol[]>(this.apiUrl, {
      headers: this.getHeaders()
    });
  }

  obtener(id: number): Observable<Rol> {
    return this.http.get<Rol>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }

  create(rol: RolCreate): Observable<Rol> {
    return this.http.post<Rol>(this.apiUrl, rol, {
      headers: this.getHeaders()
    });
  }
  update(id: number, rol: RolUpdate): Observable<Rol> {
    return this.http.put<Rol>(`${this.apiUrl}/${id}`, rol, {
      headers: this.getHeaders()
    });
  }


  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token'); 
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    });
  }
}
