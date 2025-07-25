import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Asignaciondocente } from './asignaciondocente';

describe('Asignaciondocente', () => {
  let component: Asignaciondocente;
  let fixture: ComponentFixture<Asignaciondocente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Asignaciondocente]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Asignaciondocente);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
