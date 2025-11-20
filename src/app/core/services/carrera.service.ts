import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CarreraModel } from '../models/carrera.model';
import { Observable } from 'rxjs';
import { environment } from '../environments/environments';

@Injectable({providedIn: 'root'})
    export class CarreraService{
        private baseUrl = `${environment.apiBaseUrl}/carreras/`;
        constructor(private http:HttpClient) {}
        private getAuthHeaders(): HttpHeaders {
        const token = localStorage.getItem('access_token');
        return new HttpHeaders({
        Authorization: `Bearer ${token}`
        });
    }

    listar(): Observable<CarreraModel[]> {
        return this.http.get<CarreraModel[]>(this.baseUrl, {
        headers: this.getAuthHeaders()
        });
    }

    obtener(id: number): Observable<CarreraModel> {
        return this.http.get<CarreraModel>(`${this.baseUrl}${id}`, {
        headers: this.getAuthHeaders()
        });
    }

    crear(usuario: CarreraModel): Observable<CarreraModel> {
        return this.http.post<CarreraModel>(this.baseUrl, usuario, {
        headers: this.getAuthHeaders()
        });
    }

    actualizar(id: number, usuario: Partial<CarreraModel>): Observable<CarreraModel> {
        return this.http.put<CarreraModel>(`${this.baseUrl}${id}`, usuario, {
        headers: this.getAuthHeaders()
        });
    }

    eliminar(id: number): Observable<any> {
        return this.http.delete(`${this.baseUrl}${id}`, {
        headers: this.getAuthHeaders()
        });
    }
}
    