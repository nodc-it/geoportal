import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BiopointsDialogComponent } from './biopoints-dialog.component';

describe('BiopointsDialogComponent', () => {
  let component: BiopointsDialogComponent;
  let fixture: ComponentFixture<BiopointsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BiopointsDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BiopointsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
