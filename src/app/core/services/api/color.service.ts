import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ColorService {
  constructor(private http: HttpClient) {}

  // La API permite buscar color por nombre directamente
  getHexColor(nombreColorEn: string) {
    return this.http.get<any>(`https://www.thecolorapi.com/id?named=${encodeURIComponent(nombreColorEn)}`);
  }
}
