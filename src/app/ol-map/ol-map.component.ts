import { LayersService } from '../services/layers.service';
import { rowStation, ErddapService } from 'src/app/services/erddap.service';
import { Component, OnInit } from '@angular/core';
import { View, Map } from 'ol';
import Overlay from 'ol/Overlay';
import { MatDialog } from '@angular/material/dialog';
import { AttributionsDialogComponent } from '../attributions-dialog/attributions-dialog.component';
import { easeOut } from 'ol/easing';
import Layer from 'ol/layer/Layer';
import TileWMS from 'ol/source/TileWMS';

@Component({
  selector: 'app-ol-map',
  templateUrl: './ol-map.component.html',
  styleUrls: ['./ol-map.component.scss'],
})
export class OlMapComponent implements OnInit {
	map!: Map;

  constructor(public erdappService: ErddapService, public layersService: LayersService, private matDialog: MatDialog){}

  openAttributionsDialog() {
    this.matDialog.open(AttributionsDialogComponent);
  }

  ngOnInit(): void {
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
			
			tooltipDeviceText = "&nbsp;".repeat(3) + deviceAtPixel.get('name');
			
			// Type name added only if setted (stations case)
			// Add green/red circle to show station status
			// only if stationsStatusList is not empty.
			
			if (deviceAtPixel.get('type_name') !== undefined)
			{
				let addStatus = (stationsStatusList.length != 0) ? this.getStatusCircle(stationsStatusList, deviceAtPixel.get('name')) : "";
				
				tooltipDeviceText += "&nbsp;" + deviceAtPixel.get('type_name') + addStatus;
			}
			
			// High frequency Radar case
			if (deviceAtPixel.get('name').includes("NAdr"))
				tooltipDeviceText += "&nbsp;High Frequency Radar";
			
			tooltipElement.innerHTML = tooltipDeviceText;
			
			tooltipElement.hidden = false;
		
			tooltipOverlay.setPosition(event.coordinate);
		} 
		else 
			tooltipElement.hidden = true;

		
		// ----------------
			
		event.map.getTargetElement().style.cursor = hit ? 'pointer' : '';
		
	}); // end map.on pointermove
	
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
		
		// Retrieve pointer layers objects:
		// - Radar
		// - radarArrows
		
		const layersOnMap = this.layersService.layers;
		
		let radarObj = undefined;
		
		let radarArrowsObj = undefined;

		for (let conta = 0;conta < layersOnMap.length; conta++)
		{
			if (layersOnMap[conta].get('name') == "Radar")
			{
				radarObj = layersOnMap[conta];
				
				let radarLayers = radarObj.get('layers').getArray();
				
				for (let indice = 0;indice < radarLayers.length; indice++)
				{
					if (radarLayers[indice].get('name') == "radarArrows")
						radarArrowsObj = radarLayers[indice];
					
					break;
				}
				
			} // end if
				
		} // end for

		// Settings by default to defaultLegendRange in
		// - legendRange attribute in Radar object
		// - newColorScaleRange parameter in radarArrows object

		radarObj!.set('legendRange', radarObj!.get('defaultLegendRange'));
		
		let newColorScaleRange = (radarObj!.get('defaultLegendRange')).toString();
		
		// If speed range user setting is different from default
		// legendRange and newColorScaleRange are setted
		// at user value.

		if (defaultSpeedRange == false)
		{
			radarObj!.set('legendRange', [lowLimit,highLimit]);
			
			newColorScaleRange = String(lowLimit) + ','+ String(highLimit);
		}
		
		(radarArrowsObj.getSource() as TileWMS).updateParams(
		{
			COLORSCALERANGE: newColorScaleRange,
		});
		
	} // end setSpeed
	
	// -------------------------------------------------------
	
	// Function to get green/red circle showing status
	// of a single station (device) to search in stations list (statusList).
	// Return green/red circle character.
	
	getStatusCircle(statusList:rowStation[], device:string):string
	{
		let myStatus = (statusList.find(({ name }) => name === device))!.status;
		
		let result = (myStatus == '1') ? " <a style = \"color:green;\">&#9673;</a>" : " <a style = \"color:red;\">&#9673;</a>";
	  
		return result;
	}
	
  
} // end class
