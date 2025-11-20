import { Injectable } from "@angular/core";
import { environment } from "../environments/environments";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { TipoAmbienteModel } from "../models/tipoambiente.models";

@Injectable({
    providedIn: 'root'
})
export class TipoAmbienteService{
    private apiUrl= `${environment.apiBaseUrl}/api/tiposambiente/`;
    
    constructor(private http: HttpClient){}

    private getAuthHeaders(): HttpHeaders {
        const token = localStorage.getItem('access_token');
        return new HttpHeaders({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        })
    }


    getAll(): Observable<TipoAmbienteModel[]>{
        return this.http.get<TipoAmbienteModel[]>(this.apiUrl, {headers: this.getAuthHeaders()})
    }

    getbyId(id: number): Observable<TipoAmbienteModel>{
        return this.http.get<TipoAmbienteModel>(`${this.apiUrl}${id}`, {headers: this.getAuthHeaders()})
    }

    post(tipo: TipoAmbienteModel): Observable<TipoAmbienteModel>{
        return this.http.post<TipoAmbienteModel>(this.apiUrl, tipo, {headers: this.getAuthHeaders()})
    }
    put(id: number, tipo: TipoAmbienteModel): Observable<TipoAmbienteModel> {
    return this.http.put<TipoAmbienteModel>(`${this.apiUrl}${id}`, tipo, {
        headers: this.getAuthHeaders()
    });
    }
}