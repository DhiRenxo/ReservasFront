import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocenteList } from './docentelist';

describe('DocenteList', () => {
  let component: DocenteList;
  let fixture: ComponentFixture<DocenteList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocenteList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocenteList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
