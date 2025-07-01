import { LayersService } from '../services/layers.service';
import VectorSource from 'ol/source/Vector';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import Collection from 'ol/Collection';
import Feature from 'ol/Feature';
import Geometry from 'ol/geom/Geometry';


@Component({
  selector: 'app-emodnet-dialog',
  templateUrl: './emodnet-dialog.component.html',
  styleUrls: ['./emodnet-dialog.component.scss']
})
export class EmodnetDialogComponent /*implements OnInit*/ {

  constructor
  (

    @Inject(MAT_DIALOG_DATA) public data: Collection<Feature<Geometry>>,
	
	public layersService: LayersService,

    private dialogRef: MatDialogRef<EmodnetDialogComponent>
 
  ) { }
	
	//used to determine the text in the window header
	dialogHeader:string = "Single";

	// 
	ngOnInit(): void 
	{
		
		const myLat = this.data.get("latitude");
		
		const myLon = this.data.get("longitude");
		
		this.dialogHeader = ((this.layersService.getEmodnetPtsSameCoord(myLat, myLon)).length > 1) ? "Multiple" : "Single";

	}



	// not used
  closeModal() {
    this.dialogRef.close();
  }

}
