import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocenteForm } from './docenteform';

describe('Docenteform', () => {
  let component: DocenteForm;
  let fixture: ComponentFixture<DocenteForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocenteForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocenteForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
