import { Injectable } from "@angular/core";
import { environment } from "../environments/environments";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { AmbienteModel } from "../models/ambiente.models";

@Injectable ({
    providedIn: 'root' 
})

export class AmbienteService{
    private apiUrl= `${environment.apiBaseUrl}/api/ambientes`;

    constructor(private http: HttpClient){}

    private getAuthHeaders(): HttpHeaders{
        const token = localStorage.getItem('access_token');
        return new HttpHeaders({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        })
    }

    listar(): Observable<AmbienteModel[]>{
        return this.http.get<AmbienteModel[]>(this.apiUrl, {headers: this.getAuthHeaders()});
    }

    obtener(id: number): Observable<AmbienteModel>{
        return this.http.get<AmbienteModel>(`${this.apiUrl}/${id}`, {headers: this.getAuthHeaders()});
    }

    crear(ambiente: AmbienteModel): Observable<AmbienteModel>{
        return this.http.post<AmbienteModel>(this.apiUrl, ambiente, {headers: this.getAuthHeaders()});
    }

    actualizar(id: number, amebiente:Partial<AmbienteModel>): Observable<AmbienteModel>{
        return this.http.put<AmbienteModel>(`${this.apiUrl}/${id}`, amebiente, {headers: this.getAuthHeaders()});
    }

    eliminar(id: number): Observable<any>{
        return this.http.delete(`${this.apiUrl}/${id}`, {headers: this.getAuthHeaders()});
    }

    cambiarEstado(id: number, estado: boolean): Observable<AmbienteModel> {
        return this.http.patch<AmbienteModel>(
          `${this.apiUrl}/estado/${id}`,
          { estado },
    
          { headers: this.getAuthHeaders() }
        );
      }
}