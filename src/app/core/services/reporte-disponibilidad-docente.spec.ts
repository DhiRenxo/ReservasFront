import { TestBed } from '@angular/core/testing';

import { ReporteDisponibilidadDocente } from './reporte-disponibilidad-docente.service';

describe('ReporteDisponibilidadDocente', () => {
  let service: ReporteDisponibilidadDocente;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReporteDisponibilidadDocente);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
