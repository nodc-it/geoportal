import { LayersService } from '../services/layers.service';
import VectorSource from 'ol/source/Vector';
import { Component, Inject, OnInit, HostListener } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import Collection from 'ol/Collection';
import Feature from 'ol/Feature';
import Geometry from 'ol/geom/Geometry';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';


@Component({
  selector: 'app-biopoints-dialog',
  templateUrl: './biopoints-dialog.component.html',
  styleUrls: ['./biopoints-dialog.component.scss']
})
export class BiopointsDialogComponent {
	
	userDeviceType = "d";
	
	// Listen keyup event on ESC (Escape)
	@HostListener('window:keyup.esc')
	onKeyUp()
	{
		this.dialogRef.close();
	}	

	constructor
	(

		@Inject(MAT_DIALOG_DATA) public data: Collection<Feature<Geometry>>,

		public layersService: LayersService,

		private breakpointObserver: BreakpointObserver,

		private dialogRef: MatDialogRef<BiopointsDialogComponent>

	) { }
	
	//used to determine the text in the window header
	dialogHeader:string = "Single";
	
	
	// 
	ngOnInit(): void 
	{
		
		const myLat = this.data.get("latitude");
		
		const myLon = this.data.get("longitude");
		
		this.dialogHeader = ((this.layersService.getBioPtsSameCoord(myLat, myLon)).length > 1) ? "Multiple" : "Single";
		
		// On ngOnInit we detect device used trough breakpointObserver library
		
		this.breakpointObserver.observe([Breakpoints.Handset, Breakpoints.Tablet]).subscribe(result =>
		{
			// CSS setting based on user device 
			
			if(!result.matches)
				// desktop view case
				this.userDeviceType = "d";

			else
				// handset tablet view case
				this.userDeviceType = "m";
				
		});

	} // end ngOnInit	
	

} // end class
