import { LayersService } from '../services/layers.service';
import { rowStation, ErddapService } from 'src/app/services/erddap.service';
import { Component, OnInit } from '@angular/core';
import { View, Map } from 'ol';
import Overlay from 'ol/Overlay';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { AttributionsDialogComponent } from '../attributions-dialog/attributions-dialog.component';
import { easeOut } from 'ol/easing';
import Layer from 'ol/layer/Layer';
import TileWMS from 'ol/source/TileWMS';
import { ActivatedRoute } from '@angular/router';
import { urlInfoInterface, DeviceParameters } from 'src/app/app.misc'; //

@Component({
  selector: 'app-ol-map',
  templateUrl: './ol-map.component.html',
  styleUrls: ['./ol-map.component.scss'],
})
export class OlMapComponent implements OnInit {
	map!: Map;

  constructor(public erdappService: ErddapService, public layersService: LayersService, 
				private matDialog: MatDialog, private route: ActivatedRoute){}
		

  openAttributionsDialog() {
    this.matDialog.open(AttributionsDialogComponent);
	
	
  }
  
	timeSlots:string[] = [];
	selectedTime:string = '';
	selectedDate:string = '';
	
	generateTimeSlots() {
		for (let hour = 0; hour < 24; hour++) {
		  this.timeSlots.push(this.formatTime(hour, 0));
		  this.timeSlots.push(this.formatTime(hour, 30));
		}
	}

	private formatTime(hour: number, minute: number): string {
		const h = hour.toString().padStart(2, '0');
		const m = minute.toString().padStart(2, '0');
		return `${h}:${m}`;
	}	
  
  // Pointers to some layers defined in layer.service
  // - Pointer to layer named "Radar"
  radarObjPtr = this.layersService.layers.find (item=>item.get('name') == "Radar");
  
  // - Pointer to layer named "Real Time Stations"
  stationsObjPtr = this.layersService.layers.find (item=>item.get('name') == "Real Time Stations");
  
  // - Pointer to layer named "RadarArrows"
  radarArrowsObjPtr = (this.radarObjPtr!.get('layers').getArray()).find ((item:any)=>item.get('name') == "radarArrows");
  
  // - Pointer to layer named "Sampling Stations"
  samplingObjPtr = this.layersService.layers.find (item=>item.get('name') == "Sampling Stations");
  

  ngOnInit(): void {
	  
	  this.generateTimeSlots();

	// Function to verify presence of eventual url parameter trough "route" object.
	// From observable eventually returned, we check:
	// - "msv" url parameter presence;
	// - UrlInfo object presence eventually returned by getUrlInfo function
	// If both conditions are true, we set map parameters to obtain desired view.
	
	this.route.queryParamMap
		.subscribe((parameters:any) => {
			if ((parameters['params'].msv) && (DeviceParameters.getUrlInfo(parameters['params'].msv)))
					this.SetMapView(DeviceParameters.getUrlInfo(parameters['params'].msv));

		});	  
	  
    this.map = new Map({
      target: 'map',
      layers: this.layersService.layers,
      controls: [],
      interactions: this.layersService.interactions,
      view: new View({
        center: [1685283.599632, 5360375.919583],
        zoom: 7,
        enableRotation: false,
      }),
    });
	
	// HTML element which serves as tooltip
	
	var tooltipElement = document.getElementById('tooltipOvl') as HTMLElement;
	
	// Get all stations status from erddap service.
	// Can be an empty list if erddap server does not reply.
	
	var stationsStatusList = this.erdappService.getAllStationStatus();

	// Overlay object instantiation.
	// stopEvent option setted to false to avoid
	// other events stop (like 'click').
	
	const tooltipOverlay = new Overlay({
	  element: tooltipElement,
	  stopEvent: false,
		autoPan: {
			animation: {
			duration: 250,
		},
	  }
	});	

	this.map.addOverlay(tooltipOverlay);
	
	// ----------------

    this.map.on('pointermove', event =>
	{
		var hit = event.map.hasFeatureAtPixel(event.pixel, {
		layerFilter: (layer: Layer<any>) => {
			return layer.get('selectable');
			},
		});

		// If features intersect a pixel (station or argo) on the viewport:
		// - retrieve features fields;
		// - build tooltip text;
		// - show tooltip at pixel coordinates,
		// otherwise
		// - hide tooltip (when mouse is moved out of pixel area)

		if (hit)
		{
			let deviceAtPixel = event.map.getFeaturesAtPixel(event.pixel)[0];
			
			let tooltipDeviceText = "";
			
			// Add green/red circle to show real time station status
			// only if stationsStatusList is not empty.
			// In other cases (radar, emodnet station, ecc...) status is an empty string (default).
			
			let addStatus = "";

			switch (deviceAtPixel.get('type'))
			{
				case 'buoy':
				case 'waverider':
				case 'current':
					tooltipDeviceText = "&nbsp;".repeat(3) + deviceAtPixel.get('name');
					addStatus = (stationsStatusList.length != 0) ? this.getStatusCircle(stationsStatusList, deviceAtPixel.get('name')) : "";
					
					break;
				
				case 'station':
					// in this case the tooltip does not show the specific name of a station,
					// but only if there is only one station or more than one at the specific point ("Single" or "Multiple")
					tooltipDeviceText = "&nbsp;".repeat(3) + (((this.layersService.getEmodnetPtsSameCoord(deviceAtPixel.get('latitude'), deviceAtPixel.get('longitude'))).length > 1) ? "Multiple" : "Single");
					break;
				
				default:
					tooltipDeviceText = "&nbsp;".repeat(3) + deviceAtPixel.get('name');
					break;
			}
			
			tooltipDeviceText += "&nbsp;" + deviceAtPixel.get('type_name') + addStatus;
			
			tooltipElement.innerHTML = tooltipDeviceText;
			
			tooltipElement.hidden = false;
		
			tooltipOverlay.setPosition(event.coordinate);
		} 
		else 
			tooltipElement.hidden = true;

		
		// ----------------
			
		event.map.getTargetElement().style.cursor = hit ? 'pointer' : '';
		
	}); // end map.on pointermove
	
	// ------------------------------
	
	// On map render complete event:
	// - it will be verified that:
	//		a) Sampling Stations are visible and 
	//		b) this is the first time that the user has done so.
	// In this case the attribute will be set to false so that
	// any subsequent views in the same session will not show the loading user message (view HTML file).
	
	this.map.on("rendercomplete", () =>
	{
		if (this.radarArrowsObjPtr.get('tileWMSloading'))
		{
			if ((this.selectedDate != "") && (this.selectedTime != "") && (this.layersService.tileLoadingError == false))
			{
				let objectMaxTime = new Date(this.selectedDate + "T" + this.selectedTime + ":00.000Z");
				this.radarObjPtr!.set('dateTimeActualView', objectMaxTime.toLocaleDateString('it-IT', 
					{
						timeZone: 'UTC',
						hour12: false,
						hour: 'numeric',
						minute: '2-digit',
					}
					));

			} // end internal if
			
		} // end if
				
		this.radarArrowsObjPtr.set('tileWMSloading',false);
		
		if (this.samplingObjPtr!.get('selectableFirstTime') && this.samplingObjPtr!.getVisible())
			this.samplingObjPtr!.set('selectableFirstTime', false);
		
	})
	
  } // end ngOnInit

  /**
   * Code taken from: @module ol/control/Zoom
   * @param {number} delta Zoom delta.
   * @param {duration} duration Animation duration in milliseconds (default 250).
   * @private
   */
  zoomByDelta(delta: number, duration: number = 250) {
    const view = this.map.getView();
    if (!view) {
      // the map does not have a view, so we can't act
      // upon it
      return;
    }
    const currentZoom = view.getZoom();
    if (currentZoom !== undefined) {
      const newZoom = view.getConstrainedZoom(currentZoom + delta);
      if (newZoom !== undefined) {
        if (duration > 0) {
          if (view.getAnimating()) {
            view.cancelAnimations();
          }
          view.animate({
            zoom: newZoom,
            duration: duration,
            easing: easeOut,
          });
        } else {
          view.setZoom(newZoom);
        }
      }
    }
  }
  
	// ---------------------
  
	// Function to set speed range in surface sea currents color map
	// from HF Radar data.
	// defaultSpeedRange parameter is false by default.
	// Used in  ol-map.component.html.
	
	setSpeedRange (defaultSpeedRange:boolean = false)
	{
		// Retrieve user setting from input type
		// idLowLimit and idHighLimit HTML elements
		
		let lowLimit = undefined;
		
		let highLimit = undefined;
		
		var lowLimitElement = document.getElementById('idLowLimit') as HTMLInputElement;
		
		var highLimitElement = document.getElementById('idHighLimit') as HTMLInputElement;
		
		lowLimit = lowLimitElement.value;
		
		highLimit = highLimitElement.value;

		// Settings by default to defaultLegendRange in
		// - legendRange attribute in Radar object
		// - newColorScaleRange parameter in radarArrows object

		this.radarObjPtr!.set('legendRange', this.radarObjPtr!.get('defaultLegendRange'));
		
		let newColorScaleRange = (this.radarObjPtr!.get('defaultLegendRange')).toString();
		
		// If speed range user setting is different from default
		// legendRange and newColorScaleRange are setted
		// at user value.

		if (defaultSpeedRange == false)
		{
			this.radarObjPtr!.set('legendRange', [lowLimit,highLimit]);
			
			newColorScaleRange = String(lowLimit) + ','+ String(highLimit);
		}

		this.radarArrowsObjPtr.set('tileWMSloading',true);
		
		this.layersService.updateRadarViewParamsRequest = true;
		
		this.layersService.tileLoadingError = false;
		
		(this.radarArrowsObjPtr.getSource() as TileWMS).updateParams(
		{
			COLORSCALERANGE: newColorScaleRange,
		});
		
		
	} // end setSpeed
	
	// -------------------------------------------------------
	
	// Function to get green circle/ red triangle showing status
	// of a single station (device) to search in stations list (statusList).
	// Return green circle/red triangle character.
	
	getStatusCircle(statusList:rowStation[], device:string):string
	{
		let myStatus = (statusList.find(({ name }) => name === device))!.status;
		
		let result = (myStatus == '1') ? " <a style = \"color:#005000;font-size:200%;\">&#9679;</a>" : " <a style = \"color:red;font-size:150%;\">&#9650;</a>";
	  
		return result;
	}

	// ------------------------------------
	
	
	// Function to set map view based on parameters
	// defined in file config_map_view.json.
	// Takes in input an urlInfoInterface object:
	// - set map center coordinates
	// - set desired zoom
	// - set stations visibility
	// - set radar visibility
	
	SetMapView (inputViewSetting:urlInfoInterface)
	{
		
		if (this.map.getView())
		{
			this.map.getView().setCenter(inputViewSetting.coordinateCenter);
			
			this.map.getView().setZoom(inputViewSetting.zoomLevel);
			
			if (inputViewSetting.stationsYN == 1)
				this.stationsObjPtr!.setVisible(true);
			else
				this.stationsObjPtr!.setVisible(false);

			if (inputViewSetting.radarYN == 1)
				this.radarObjPtr!.setVisible(true);
			else
				this.radarObjPtr!.setVisible(false);
			
		}
		
	} // end SetMapView	
	
	// Function to set Date and Time chosen by user
	// in radar panel.
	// Check if HTML select date and time are not null,
	// then set layerservice member variable updateRadarViewParamsRequest, tileLoadingError, tileWMSloading
	// and call layersService setLayerRadarDateTime member function,
	// building date and time string with member variable selectedDate and selectedTime,
	// linked at HTML select trough ngModel.
	
	setRadarDateTime()
	{
		if ((this.selectedDate.trim() == "") || (this.selectedTime.trim() == ""))
			alert("Invalid Date or Time selected");
		else
		{
			this.layersService.updateRadarViewParamsRequest = true;
			
			this.layersService.tileLoadingError = false;
			
			this.radarArrowsObjPtr.set('tileWMSloading',true);
			
			this.layersService.setLayerRadarDateTime(this.selectedDate + "T" + this.selectedTime);
		}
		
	} //end setRadarDateTime()
	
	// Functions to set Oldest / Newest
	// available date and time in 4 last months.
	// Get min/max selectable Date and Time from layers Radar object
	// and set ngModel member variables in HTML select.
	// Call setRadarDateTime.

	setOldestDateTime()
	{
		this.selectedDate = this.radarObjPtr!.get('minSelectableDate');
		
		this.selectedTime = this.radarObjPtr!.get('minSelectableTime');
		
		this.setRadarDateTime();
		
	} //end setOldestDateTime()

	setNewestDateTime()
	{
		this.selectedDate = this.radarObjPtr!.get('maxSelectableDate');
		
		this.selectedTime = this.radarObjPtr!.get('maxSelectableTime');
		
		this.setRadarDateTime();
		
	} // end setNewestDateTime()

  
} // end class
