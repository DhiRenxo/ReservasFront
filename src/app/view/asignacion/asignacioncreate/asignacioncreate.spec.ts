import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsignacionCreateComponent  } from './asignacioncreate';

describe('Asignacioncreate', () => {
  let component: AsignacionCreateComponent ;
  let fixture: ComponentFixture<AsignacionCreateComponent >;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AsignacionCreateComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AsignacionCreateComponent );
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
