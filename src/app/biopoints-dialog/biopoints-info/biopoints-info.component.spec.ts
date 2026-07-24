import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BiopointsInfoComponent } from './biopoints-info.component';

describe('BiopointsInfoComponent', () => {
  let component: BiopointsInfoComponent;
  let fixture: ComponentFixture<BiopointsInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BiopointsInfoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BiopointsInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
