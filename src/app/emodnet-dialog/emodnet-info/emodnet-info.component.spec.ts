import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmodnetInfoComponent } from './emodnet-info.component';

describe('EmodnetInfoComponent', () => {
  let component: EmodnetInfoComponent;
  let fixture: ComponentFixture<EmodnetInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmodnetInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmodnetInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
