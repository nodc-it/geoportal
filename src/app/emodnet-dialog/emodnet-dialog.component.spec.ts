import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmodnetDialogComponent } from './emodnet-dialog.component';

describe('EmodnetDialogComponent', () => {
  let component: EmodnetDialogComponent;
  let fixture: ComponentFixture<EmodnetDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmodnetDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmodnetDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
