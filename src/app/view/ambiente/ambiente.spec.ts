import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Ambiente } from './ambiente';

describe('Ambiente', () => {
  let component: Ambiente;
  let fixture: ComponentFixture<Ambiente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Ambiente]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Ambiente);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
