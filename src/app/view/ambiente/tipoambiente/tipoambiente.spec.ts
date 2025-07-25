import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Tipoambiente } from './tipoambiente';

describe('Tipoambiente', () => {
  let component: Tipoambiente;
  let fixture: ComponentFixture<Tipoambiente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tipoambiente]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Tipoambiente);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
