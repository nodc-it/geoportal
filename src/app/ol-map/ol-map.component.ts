import { LayersService } from '../services/layers.service';
import { Component, OnInit } from '@angular/core';
import { View, Map } from 'ol';
import Overlay from 'ol/Overlay';
import { MatDialog } from '@angular/material/dialog';
import { AttributionsDialogComponent } from '../attributions-dialog/attributions-dialog.component';
import { easeOut } from 'ol/easing';
import Layer from 'ol/layer/Layer';

@Component({
  selector: 'app-ol-map',
  templateUrl: './ol-map.component.html',
  styleUrls: ['./ol-map.component.scss'],
})
export class OlMapComponent implements OnInit {
  map!: Map;

  constructor(public layersService: LayersService, private matDialog: MatDialog){}

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

		// If features intersect a pixel (station) on the viewport:
		// - retrieve features fields;
		// - build tooltip text;
		// - show tooltip at pixel coordinates,
		// otherwise
		// - hide tooltip (when mouse is moved out of pixel area)

		if (hit)
		{
			let stationAtPixel = event.map.getFeaturesAtPixel(event.pixel)[0];
			
			let tooltipStationText = "&nbsp;".repeat(3) + stationAtPixel.get('name') + " " + stationAtPixel.get('type_name');
			
			tooltipElement.innerHTML = tooltipStationText;
			
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
}
