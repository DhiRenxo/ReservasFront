import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Asignacionvalidacion } from './asignacionvalidacion';

describe('Asignacionvalidacion', () => {
  let component: Asignacionvalidacion;
  let fixture: ComponentFixture<Asignacionvalidacion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Asignacionvalidacion]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Asignacionvalidacion);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
