import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteDocenteAsignados } from './reporte-docente-asignados';

describe('ReporteDocenteAsignados', () => {
  let component: ReporteDocenteAsignados;
  let fixture: ComponentFixture<ReporteDocenteAsignados>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReporteDocenteAsignados]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReporteDocenteAsignados);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
