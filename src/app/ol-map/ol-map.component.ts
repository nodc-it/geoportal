import { LayersService } from '../services/layers.service';
import { rowStation, ErddapService, Parameter, DataType, Measurement } from 'src/app/services/erddap.service'; //
import { VocabService } from 'src/app/services/vocab.service'; //
import { Component, OnInit } from '@angular/core';
import { View, Map } from 'ol';
import Overlay from 'ol/Overlay';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { AttributionsDialogComponent } from '../attributions-dialog/attributions-dialog.component';
import { easeOut } from 'ol/easing';
import Layer from 'ol/layer/Layer';
import TileWMS from 'ol/source/TileWMS';
import { ActivatedRoute } from '@angular/router';
import { urlInfoInterface, DeviceParameters, DateFunctions } from 'src/app/app.misc'; //
import { forkJoin, Observable, of } from 'rxjs'; //
import { catchError, timeout } from 'rxjs/operators';


@Component({
  selector: 'app-ol-map',
  templateUrl: './ol-map.component.html',
  styleUrls: ['./ol-map.component.scss'],
})
export class OlMapComponent implements OnInit {
	map!: Map;
	
	// sei of Overlay for Data Comparison tooltip
	private metadataOverlays: Overlay[] = [];
	
	// Maintains the highest z-index for tooltips brought to the foreground.
	private maxTooltipZIndex = 100;
	
	isMetadataLoading: boolean = false;



  constructor(public erdappService: ErddapService, public layersService: LayersService, private vocabService: VocabService,
				private matDialog: MatDialog, private route: ActivatedRoute){}



//--------------

// Function to show Data comparison tooltip
	
showMetadataTooltips(metadataName: string): void
{
	this.hideMetadataTooltips();
	if (!this.stationsObjPtr) return;
	const source = (this.stationsObjPtr as any).getSource();
	if (!source) return;

	// Reads the sensor map from layer.service.
	const sensorCodes = this.layersService.metadataSensorMapping[metadataName];

	if (!sensorCodes) return;

	// Find the list of compatible stations and their associated real sensors from the JSON.
	// stationsWithSensor will be an array of pairs, e.g., [ ["MAMBO1", "TEMP_1"], ["MAMBO3", "TEMP"] ]
	const stationsWithSensor = DeviceParameters.findMetadata(sensorCodes);

	// We create a key-value map [StationName -> SpecificSensor] for quick lookup.

	const stationSensorMap: { [stationName: string]: string } = {};
	stationsWithSensor.forEach((pair: any) => {
	  if (Array.isArray(pair) && pair.length >= 2) {
		stationSensorMap[pair[0]] = pair[1];
	  } else if (pair && pair.station && pair.sensor) { // Coverage for cases where an object is returned instead of an array.
		stationSensorMap[pair.station] = pair.sensor;
	  }
	});


	const stationsStatusList = this.erdappService.getAllStationStatus() || [];
	const features = source.getFeatures();

	// Structure for storing which sensor is used by each valid feature for the second cycle.
	const validFeaturesForRequest: { feature: any; sensorCode: string }[] = [];
	const requests: { [stationName: string]: Observable<any> } = {};
	const timeStart = DateFunctions.daysAgoMidnightUTC(7);

	features.forEach((feature: any) => {
	  const stationName = feature.get('name');
	  if (!stationName) return;

	 // =========================================================================
	 // TEMPORARY DEACTIVATION OF STATION E2M3A
	 // Remove or comment out this if block to reactivate the station.
	 // =========================================================================
	 if (stationName === 'E2M3A') {
	   return; // Skip the station and avoid creating the tooltip for any data.
	 }
	 // =========================================================================


	  // Check if the station exists as a key in the object.
	  if (!stationSensorMap.hasOwnProperty(stationName)) return;
	  
	  // Retrieve the specific sensor code from the object.
	  const exactSensorCode = stationSensorMap[stationName];

	  // CHECK 2: Is the station active?
	  const stationStatusObj = stationsStatusList.find((s: any) => s.name === stationName);
	  const isActive = stationStatusObj && stationStatusObj.status === '1';
	  if (!isActive) return;

	  validFeaturesForRequest.push({ feature, sensorCode: exactSensorCode });
	  
	  const parameter: Parameter = {
		name: exactSensorCode,
		type: DataType.TIME_SERIES
	  };

		// Retrieve requested data and make a 3 seconds timeout
		// to give time loading data from all interested stations.
	  requests[stationName] = this.erdappService.getLastMeasurements(stationName, parameter, timeStart).pipe(
		timeout(3000),
		catchError(err => {
		  console.warn(`Stazione ${stationName} andata in timeout o fallita:`, err);
		  return of({ timeoutError: true });
		})
	  );
	});


	if (Object.keys(requests).length === 0) return;

	this.isMetadataLoading = true;

	forkJoin(requests).subscribe({
	next: (bulkResults: { [stationName: string]: any }) => {
	  validFeaturesForRequest.forEach((item) => {
		const stationName = item.feature.get('name');
		const result = bulkResults[stationName];
		
		// We pass the correct station-specific sensor code to the rendering process.
		this.renderSingleTooltip(item.feature, stationName, result, item.sensorCode, metadataName);
	  });
	  this.isMetadataLoading = false;
	},
	error: (err) => {
	  console.error("Errore nel forkJoin dei metadati:", err);
	  this.isMetadataLoading = false;
	}
	});
	
} // end function



//-------------------

// Function to render every single tooltip
// following "data comaprison" menù choice.

private renderSingleTooltip(feature: any, stationName: string, result: any, sensorCode: string, metadataName: string): void {
  // If an overlay already exists for this station (e.g., a previous attempt that timed out), we remove it first.
  this.removeOverlayForStation(stationName);

  const localizedName = this.vocabService.getMeasurementName(stationName, sensorCode) || metadataName;
  const unit = this.vocabService.getMeasurementUnit(stationName, sensorCode) || '';
  
  let formattedMeasure = 'Data not available';
  let formattedDate = '-';
  let formattedHour = '-';
  let formattedDepth = '-';
  let showReloadLink = false;

  // Let's check if the response triggered our custom timeout.
  if (result && result.timeoutError) {
    formattedMeasure = '<span style="color: #c62828; font-weight: 500;">Wait expired</span>';
    showReloadLink = true;
  } else if (result && Array.isArray(result) && result.length > 0) {
    const lastData = result[result.length - 1];
    formattedMeasure = `${Number(lastData.measurement).toFixed(2)} ${unit}`;
    if (lastData.timestamp) {
      const measurementDate = new Date(lastData.timestamp);
      formattedDate = measurementDate.toLocaleDateString('it-IT');
      formattedHour = measurementDate.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
    }
    if (lastData.depth !== undefined && lastData.depth !== null) {
      formattedDepth = `${lastData.depth} m`;
    }
  }

  const coordinate = feature.getGeometry().getCoordinates();
  const element = document.createElement('div');
  
  // We assign an identifying attribute to the div so that it can be located during removal.
  element.setAttribute('data-station', stationName);

  let htmlContent = `
    <strong>${stationName}</strong><br>
    <span style="color: #003c88; font-weight: 500;">${localizedName}</span><br>
    <div class="measure-container">${formattedMeasure}</div>
    ${formattedDate}<br>
    ${formattedHour}<br>
    ${formattedDepth}
  `;

  // If the station has timed out, we post the clickable HTML link.
  if (showReloadLink) {
    htmlContent += `
      <div style="margin-top: 6px; border-top: 1px dashed #ccc; padding-top: 4px; text-align: center;">
        <a href="javascript:void(0);" class="reload-metadata-btn" 
           style="color: #0056b3; text-decoration: underline; font-weight: bold; font-size: 11px;">
           Click to reload
        </a>
      </div>
    `;
  }

  element.innerHTML = htmlContent;

  // --- GRAPHIC STYLE (Adapted to allow clicking) ---
  element.style.position = 'absolute';
  element.style.whiteSpace = 'nowrap';
  element.style.backgroundColor = '#ffffff';
  element.style.color = '#333333';
  element.style.padding = '8px 12px';
  element.style.borderRadius = '10px';
  element.style.border = '1px solid #cccccc';
  element.style.boxShadow = '0px 2px 6px rgba(0,0,0,0.2)';
  element.style.fontFamily = 'Roboto, "Helvetica Neue", sans-serif';
  element.style.fontSize = '12px';
  element.style.lineHeight = '1.4';
  
  // NOTE: Removed the "pointerEvents = 'none'" line to allow clicking the link.

  const overlay = new Overlay({
    element: element,
    position: coordinate,
    positioning: 'center-left',
    offset:[15,0],
    stopEvent: true // Set to true so that the click on the link does not propagate to the map underneath.
  });

	// =========================================================================
	// Bring the tooltip to the foreground on click.
	// It targets the native .ol-overlay-container and assigns the z-index to it.
	// =========================================================================
	element.addEventListener('click', (e) => {
	// Se l'utente ha cliccato sul link di reload, non interferiamo
	const target = e.target as HTMLElement;
	if (target.classList.contains('reload-metadata-btn')) {
	 return;
	}

	// Let's trace back to the container div created by OpenLayers.
	const overlayContainer = element.parentElement;
	if (overlayContainer) {
	 this.maxTooltipZIndex++;
	 overlayContainer.style.zIndex = this.maxTooltipZIndex.toString();
	}
	});
	// =========================================================================




  // If the reload button is present, we attach the native click event to it.
  if (showReloadLink) {
    const btn = element.querySelector('.reload-metadata-btn');
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.reloadSingleStationMetadata(feature, stationName, sensorCode, metadataName, element);
      });
    }
  }

  this.map.addOverlay(overlay);
  this.metadataOverlays.push(overlay);
}



//-------------------

private reloadSingleStationMetadata(feature: any, stationName: string, sensorCode: string, metadataName: string, tooltipElement: HTMLElement): void {
  // We are temporarily replacing the measurement in the tooltip with a waiting message and a text-based spinner.
  const measureContainer = tooltipElement.querySelector('.measure-container');
  if (measureContainer) {
    measureContainer.innerHTML = '<span style="color: #003c88;">Loading...</span>';
  }
  // We hide the reload link during the new call.
  const reloadBtnContainer = tooltipElement.lastElementChild as HTMLElement;
  if (reloadBtnContainer && reloadBtnContainer.tagName === 'DIV') {
    reloadBtnContainer.style.display = 'none';
  }

  const parameter: Parameter = {
    name: sensorCode,
    type: DataType.TIME_SERIES
  };
  const timeStart = DateFunctions.daysAgoMidnightUTC(2);

  // We execute the single, isolated ERDDAP call (without a 3-second timeout; we let the server respond at its own pace).
  this.erdappService.getLastMeasurements(stationName, parameter, timeStart).pipe(
    catchError(err => {
      console.error(`Errore durante il reload singolo per ${stationName}:`, err);
      return of({ timeoutError: true });
    })
  ).subscribe((result: any) => {
    // We are redesigning the individual tooltip while updating the data on the map.
    this.renderSingleTooltip(feature, stationName, result, sensorCode, metadataName);
  });
}



//------------------


// Helper method in the OlMapComponent class to clear individual overlays if they overlap.
private removeOverlayForStation(stationName: string): void
{
	const overlaysToRemove = this.metadataOverlays.filter((overlay: any) => {
		const element = overlay.getElement();
		return element && element.getAttribute('data-station') === stationName;
	});

	overlaysToRemove.forEach((overlay: any) => {
		this.map.removeOverlay(overlay);
		const index = this.metadataOverlays.indexOf(overlay);
		if (index > -1)
		{
			this.metadataOverlays.splice(index, 1);
		}
	});
}

	
	
	
	//--------------

	// Removes all generic overlays from the map.

	hideMetadataTooltips(): void {

	  this.metadataOverlays.forEach(overlay => {
		this.map.removeOverlay(overlay);
	  });
	  this.metadataOverlays = [];
	}


				
		

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

  // - Pointer to layer named "Biodiversity stations"
  BioDiversityObjPtr = this.layersService.layers.find (item=>item.get('name') == "Biodiversity stations");
  

  ngOnInit(): void {
	  
	  this.generateTimeSlots();
	  
	// Ascolta il click dal menu a tendina per qualsiasi tipo di metadato
	this.layersService.activeMetadata$.subscribe(metadataName => {
	  if (metadataName) {
		// Se c'è un metadato attivo (stringa), mostra i tooltip personalizzati
		this.showMetadataTooltips(metadataName);
	  } else {
		// Se è null, nascondi tutto
		this.hideMetadataTooltips();
	  }
	});

	  

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

				case 'sites':
					// in this case the tooltip does not show the specific name of a station,
					// but only if there is only one station or more than one at the specific point ("Single" or "Multiple")
					tooltipDeviceText = "&nbsp;".repeat(3) + (((this.layersService.getBioPtsSameCoord(deviceAtPixel.get('latitude'), deviceAtPixel.get('longitude'))).length > 1) ? "Multiple" : "Single");
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
		
		if (this.BioDiversityObjPtr!.get('selectableFirstTime') && this.BioDiversityObjPtr!.getVisible())
			this.BioDiversityObjPtr!.set('selectableFirstTime', false);		
		
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
