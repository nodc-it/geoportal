import { Component, Inject, OnInit, ViewChild} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import Collection from 'ol/Collection';
import Feature from 'ol/Feature';
import Geometry from 'ol/geom/Geometry';
import { VocabService } from '../services/vocab.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { GraphsComponent } from 'src/app/detail-dialog/graphs/graphs.component';

@Component({
  selector: 'app-detail-dialog',
  templateUrl: './detail-dialog.component.html',
  styleUrls: ['./detail-dialog.component.scss'],
})
export class DetailDialogComponent{
	
	// String array, visible in GraphsComponent, with default css based on user device:
	// - position 0: mat-card css
	// - position 1: mat-card-content css
	// - position 2: device type ("d" for desktop, "m" for mobile)
	
	userDeviceType = ["series_card_desktop","desktop_font_size","d"];
	
	@ViewChild(GraphsComponent) myGraphsChild!:GraphsComponent;
	
	
	
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Collection<Feature<Geometry>>,

    private dialogRef: MatDialogRef<DetailDialogComponent>,
	private breakpointObserver: BreakpointObserver,
    public vocabService: VocabService, //not used
	
  ) {}

	// not used
  closeModal() {
    this.dialogRef.close();
  }
  
	ngOnInit(): void 
	{
		// On ngOnInit we detect device used trough breakpointObserver library
		
		this.breakpointObserver.observe([Breakpoints.Handset, Breakpoints.Tablet]).subscribe(result =>
		{
			// CSS setting based on user device 
			
			if(!result.matches)
				// desktop view case
				this.userDeviceType = ["series_card_desktop","desktop_font_size","d"];

			else
				// handset tablet view case
				this.userDeviceType = ["series_card_mobile","mobile_font_size","m"];
				
		});
			
	} // end ngOnInit

	// Function to manage resize graph
	// when the user click mat-tab label="Graphs"

	onTabClick (event:any)
	{
	const tab = event.tab.textLabel;
		
		if (tab == "Graphs")
		{
			// call GraphsComponent function resizeGraph()
			this.myGraphsChild.resizeGraph();
		}
		
	} // end onTabClick
	

}
