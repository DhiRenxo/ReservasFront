import { TestBed } from '@angular/core/testing';

import { ReporteDocentesAsignados } from './reporte-docentes-asignados.service';

describe('ReporteDocentesAsignados', () => {
  let service: ReporteDocentesAsignados;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReporteDocentesAsignados);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
