import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Seccion } from './seccion';

describe('Seccion', () => {
  let component: Seccion;
  let fixture: ComponentFixture<Seccion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Seccion]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Seccion);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
