import { LayersService } from '../../services/layers.service';
import { Component, Input, OnInit } from '@angular/core';
import Collection from 'ol/Collection';
import Feature from 'ol/Feature';
import Geometry from 'ol/geom/Geometry';

@Component({
  selector: 'app-emodnet-info',
  templateUrl: './emodnet-info.component.html',
  styleUrls: ['./emodnet-info.component.scss']
})
export class EmodnetInfoComponent implements OnInit {

	constructor(public layersService: LayersService) { }

	@Input() data!: Collection<Feature<Geometry>>;
  
	// Array with emdonet info station
	arrayEmodnetInfoStation:string[][] = [];
	
	// Array with type of emdonet info station
	displayedRows: string[] = ['Station','Cruise', 'LOCAL_CDI', 'ERDDAP'];
  
	// Retrieve emodnet info station from features
	
	ngOnInit(): void 
	{
		this.arrayEmodnetInfoStation = this.layersService.getEmodnetPtsSameCoord(this.data.get("latitude"), this.data.get("longitude"));
	}
	

} // end class
