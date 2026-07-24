import { LayersService } from '../../services/layers.service';
import { Component, Input, OnInit } from '@angular/core';
import Collection from 'ol/Collection';
import Feature from 'ol/Feature';
import Geometry from 'ol/geom/Geometry';


@Component({
  selector: 'app-biopoints-info',
  templateUrl: './biopoints-info.component.html',
  styleUrls: ['./biopoints-info.component.scss']
})
export class BiopointsInfoComponent {

	constructor(public layersService: LayersService) { }

	@Input() data!: Collection<Feature<Geometry>>;
  
	// Array with BioDiversity info station
	arrayBioDiversityInfoStation:string[][] = [];
	
	// Array with type of BioDiversity info station
	displayedRows: string[] = [	'title',
								'startDate',
								'endDate',
								'locationID',
								'alt_id'
								];
  
	// Retrieve BioDiversity info station from features
	
	ngOnInit(): void 
	{
		this.arrayBioDiversityInfoStation = this.layersService.getBioPtsSameCoord(this.data.get("latitude"), this.data.get("longitude"));
	}


}
