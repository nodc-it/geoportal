import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { DataType, ErddapService, Measurement } from 'src/app/services/erddap.service';
import { VocabService } from 'src/app/services/vocab.service';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import Collection from 'ol/Collection';
import Feature from 'ol/Feature';
import Geometry from 'ol/geom/Geometry';
import { DateFunctions } from 'src/app/app.misc';
import { DeviceParameters } from 'src/app/app.misc';

@Component({
  selector: 'app-data-table',
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss'],
})
export class DataTableComponent implements OnInit {
  constructor(private erdappService: ErddapService, public vocabService: VocabService) {}
  @Input() data!: Collection<Feature<Geometry>>;

  @ViewChild(MatSort)
  sort!: MatSort;
  @ViewChild(MatPaginator)
  paginator!: MatPaginator;

  cardsMeasurement = new MatTableDataSource();
  loading = 0;
  displayedColumns: string[] = ['parameter', 'measurement', 'depth', 'timestamp'];

  ngOnInit(): void {
	
	let dialogParam = (DeviceParameters.getSensorDialogPar(this.data.get('name')));
	
    dialogParam.map((param: string, index: number) => {
      this.loading++;
      this.erdappService
        .getLastMeasurements(
          this.data.get('name'),
          { name: param, type: DataType.TIME_SERIES },
          DateFunctions.daysAgoMidnightUTC(7)
        )
        .subscribe(
          (response: Measurement[]) => {
            this.cardsMeasurement.data = this.cardsMeasurement.data.concat(response);
            (this.cardsMeasurement.data as Measurement[]).sort(
              (a, b) => dialogParam.indexOf(a.parameter.name) - dialogParam.indexOf(b.parameter.name)
            );
            this.cardsMeasurement._updateChangeSubscription();
          },
          (error: any) => {
            this.loading--;
            console.log(error);
          },
          () => this.loading--
        );
    });
  }

  ngAfterViewInit(): void {
    this.cardsMeasurement.paginator = this.paginator;
    this.cardsMeasurement.sort = this.sort;
    this.cardsMeasurement.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'parameter':
          return this.vocabService.getMeasurementName((item as Measurement).parameter.name);
        default:
          return (item as any)[property];
      }
    };
  }

  prettyFormat(timestamp: Date): string {
    return new Date(timestamp).toLocaleTimeString([], {
      day: 'numeric',
      month: 'numeric',
      year: '2-digit',
      hour: 'numeric',
      minute: '2-digit',
    });
  }
}
