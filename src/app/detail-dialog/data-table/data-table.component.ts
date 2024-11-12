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
  
  // User message to signal data availability / not availability
  displayedMsgAvailability: string[] = [
										'Last measurements of data collected in the last week:', 
										'No data collected in the last week<br><br>'
										];

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
          return this.vocabService.getMeasurementName(this.data.get('name'), (item as Measurement).parameter.name);
        default:
          return (item as any)[property];
      }
    };
  }

	// Function executed after DOM visibility.
	// If cardsMeasurement data array has some element,
	// only the message below is hidden,
	// else also Table and Paginator are hidden.
	// In both cases is shown the appropriate user message.
	ngAfterViewChecked(): void 
	{
		var divCmDataAvailability = document.getElementById("idDataAvailability") as HTMLElement;
		
		var matTableElem = document.getElementById("idMatTable") as HTMLElement;
		
		var matPaginatorElem = document.getElementById("idMatPaginator") as HTMLElement;
		
		var iMessageBelow = document.getElementById("idMessageBelow") as HTMLElement;
		
		if (divCmDataAvailability && (this.loading == 0))
		{
			if (this.cardsMeasurement.data.length > 0)
			{
				divCmDataAvailability.innerHTML = this.displayedMsgAvailability[0];
				
				if (iMessageBelow)
					iMessageBelow.hidden = true;
			}
			else
			{
				divCmDataAvailability.innerHTML = this.displayedMsgAvailability[1];
				
				if (matTableElem)
					matTableElem.hidden = true;
				
				if (matPaginatorElem)
					matPaginatorElem.hidden = true;
				
				if (iMessageBelow)
					iMessageBelow.hidden = true;
			}
			
			divCmDataAvailability.hidden = false;
		}
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
