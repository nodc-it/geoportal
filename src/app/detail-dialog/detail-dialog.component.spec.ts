import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { DetailDialogComponent } from './detail-dialog.component';

describe('DetailDialogComponent', () => {
  let component: DetailDialogComponent;
  let fixture: ComponentFixture<DetailDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DetailDialogComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: {} },

        {
          provide: MatDialogRef,
          useValue: {},
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  /* TODO: correct tests
  it('should create', () => {
    expect(component).toBeTruthy();
  });
  */
});
