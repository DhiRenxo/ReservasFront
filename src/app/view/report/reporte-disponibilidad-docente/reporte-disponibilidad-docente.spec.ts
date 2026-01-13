import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteDisponibilidadDocente } from './reporte-disponibilidad-docente';

describe('ReporteDisponibilidadDocente', () => {
  let component: ReporteDisponibilidadDocente;
  let fixture: ComponentFixture<ReporteDisponibilidadDocente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReporteDisponibilidadDocente]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReporteDisponibilidadDocente);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
