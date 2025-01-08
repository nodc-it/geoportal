import { Component, Input, OnInit } from '@angular/core';
import { ErddapService} from 'src/app/services/erddap.service';
import Collection from 'ol/Collection';
import Feature from 'ol/Feature';
import Geometry from 'ol/geom/Geometry';


@Component({
  selector: 'app-info',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.scss']
})
export class InfoComponent implements OnInit {

	constructor(private erdappService: ErddapService) { }

	@Input() data!: Collection<Feature<Geometry>>;

	// Array with Info station
	arrayInfoStation:string[] = [];

	// Variable to count array Info station elements.
	// Used in HTML code to decide if show or not div with table.
	loading = 0;

	ngOnInit(): void
	{

		// Code to retrieve global information
		// about specific fields, part of NC GLOBAL Erddap tableportion
		// specific for "this.data.get('name')" device.
		// Implements subscribe of Erddap service function getNcGlobalInfoStation.

		this.erdappService.getNcGlobalInfoStation(this.data.get('name'))!.subscribe
		((nc_global_rows: string[][]) =>{
			
			let displayedRows: string[] = ['Latitude', 'Longitude', 'Institution', 'Institution EDMO code'];
			
			let displayedRowsCounter = 0;

			// Retrieve only Latitude, Longitude, institution and edmo code
			// from global data.

			for (let index = 0;index < nc_global_rows!.length; index++)
			{
				if ((nc_global_rows[index][2] == "geospatial_lat_min") ||
					(nc_global_rows[index][2] == "geospatial_lon_min") ||
					(nc_global_rows[index][2] == "institution") ||
					(nc_global_rows[index][2] == "institution_edmo_code"))
				{
					this.arrayInfoStation [this.loading++] = displayedRows[displayedRowsCounter++];
					this.arrayInfoStation [this.loading++] = nc_global_rows[index][4];
					continue;
				}

			} // end for

			},
			  (error: any) =>
			  {
				this.loading--;
				console.log(error);
			  }
			
		); // end subscribe

	} // end ngOnInit

} // end OnInit
