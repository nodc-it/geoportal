import Geometry from 'ol/geom/Geometry';
import WMSCapabilities from 'ol/format/WMSCapabilities';
import { Injectable } from '@angular/core';
import GeoJSON from 'ol/format/GeoJSON';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Style, Icon } from 'ol/style';
import { bbox as bboxStrategy } from 'ol/loadingstrategy';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import TileWMS from 'ol/source/TileWMS';
import Feature, { FeatureLike } from 'ol/Feature';
import { StyleFunction } from 'ol/style/Style';
import BaseLayer from 'ol/layer/Base';
import XYZ from 'ol/source/XYZ';
import LayerGroup from 'ol/layer/Group';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import Stroke from 'ol/style/Stroke';
import { Interaction, defaults, Select } from 'ol/interaction';
import { DetailDialogComponent } from '../detail-dialog/detail-dialog.component';
import { EmodnetDialogComponent } from '../emodnet-dialog/emodnet-dialog.component'; //
import { MatLegacyDialog as MatDialog, MatLegacyDialogConfig as MatDialogConfig } from '@angular/material/legacy-dialog';
import { DateFunctions } from '../app.misc';
import Overlay from 'ol/Overlay';
import { ErddapService } from 'src/app/services/erddap.service';

@Injectable({
  providedIn: 'root',
})
export class LayersService {
  layers: BaseLayer[] = [];
  interactions: Interaction[] = defaults().getArray();
  
  // flag to signal a request for an update UTC view following a user selection
  updateRadarViewParamsRequest = false;
  
  // flag to indicate an error loading tiles from WMS server
  tileLoadingError = false;


  constructor(private http: HttpClient, private matDialog: MatDialog, private matEmodnetDialog: MatDialog, public erdappService: ErddapService) {
    let osm = new TileLayer({
      source: new OSM(),
    });
    osm.set('name', 'OpenStreetMap');
    osm.set('base', true);
    this.layers.push(osm);

    let bathymetry = new TileLayer({
      source: new TileWMS({
        url: 'https://ows.emodnet-bathymetry.eu/wms',
        params: { LAYERS: 'mean_atlas_land' },
      }),
    });
    bathymetry.set('name', 'EMODnet Bathymetry');
    bathymetry.set('base', true);
    bathymetry.setVisible(false);
    this.layers.push(bathymetry);

    let esri = new TileLayer({
      source: new XYZ({
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/' + 'World_Imagery/MapServer/tile/{z}/{y}/{x}',
      }),
    });
    esri.set('name', 'ESRI imagery');
    esri.set('base', true);
    esri.setVisible(false);
    this.layers.push(esri);

    let argoPoints = new VectorLayer({
      source: new VectorSource({
        url:
          'http://maosapi.ogs.it/v0.1/time-markers-def' +
          '?nationality=ITALY' +
          '&type=drifter,float,glider' +
          '&date_from=' +
          DateFunctions.daysAgoMidnightUTC(30).toISOString().substring(0, 10),
        format: new GeoJSON(),
      }),
      style: this.styleByType,
    });
    argoPoints.set('selectable', true);

    let argoTrajectory = new VectorLayer({
      source: new VectorSource(),
      style: feature => {
        return new Style({
          stroke: new Stroke({
            color: feature.get('stroke'),
          }),
        });
      },
    });
	
    let argo = new LayerGroup({
      layers: [argoTrajectory, argoPoints],
    });
    argo.set('name', 'Argo');

    let argoSelect = new Select({
      layers: [argoPoints],
      style: this.styleByType,
    });
    argoSelect.on('select', e => {
      let argoTrajectorySource = argoTrajectory.getSource()!;
      e.selected.forEach((feature: Feature<any>) => {
        if (argoTrajectorySource.getFeatureById(feature.get('id')) === null)
          this.getArgoTrejectory(feature.get('type'), feature.get('id')).subscribe(
            (response: Feature<Geometry>) => {
              argoTrajectorySource.addFeature(response);
            },
            (error: any) => {
              console.log(error);
            }
          );
        else argoTrajectorySource.removeFeature(argoTrajectorySource.getFeatureById(feature.get('id'))!);
      });
      argoSelect.getFeatures().clear();
    });

    let radarArrows = new TileLayer({
      source: new TileWMS({
        url: 'https://erddap.hfrnode.eu/ncWMS/wms',
        params: {
          LAYERS: 'HFR-NAdr-Total-Last4Months/EWCT:NSCT-group',
          TILED: true,
          STYLES: 'default-vector/x-Rainbow',
		  COLORSCALERANGE: '0, 0.5',
          ABOVEMAXCOLOR: 'extend',
          BELOWMINCOLOR: 'extend',
        },
      }),
    });
	radarArrows.set('name','radarArrows');
	
	// internal flag to indicate WMS in progress loading operation
	radarArrows.set('tileWMSloading',true);
	
	// "Tile load error" event handler.
	// On tile load error:
	// If there has been a request to update the view, 
	// - the user is warned of the possible error coming from an unavailable date/time or from a failed tile loading;
	// - member variable updateRadarViewParamsRequest, tileLoadingError and tileWMSloading are set
	//		to specific values to reset request update, avoid UTC view update on rendercomplete, and make visible card radar parameters.
	
	(radarArrows.getSource() as TileWMS).on('tileloaderror', event=> {
		if (this.updateRadarViewParamsRequest)
		{
			//console.log("Errore nel caricamento della tile:", event.tile);
			alert("Date/Time view not available or Tile loading error.\r\rIf Date and Time are available, loading data operation could be incomplete.");
			
			this.updateRadarViewParamsRequest = false;
			
			this.tileLoadingError = true;
			
			radarArrows.set('tileWMSloading',false);
		}
	});
	
    fetch(radarArrows.getSource()!.getUrls()?.[0] + '?SERVICE=WMS&REQUEST=GetCapabilities&VERSION=1.3.0&DATASET=HFR-NAdr-Total-Last4Months')
      .then(function (response) {
        return response.text();
      })
      .then(function (text) {
        let result = new WMSCapabilities().read(text);
		let times = result.Capability.Layer.Layer[0].Layer[8].Layer[0].Dimension[0].values.split(',');

        radar.set('times', times);
		
		let stringMaxTime = result.Capability.Layer.Layer[0].Layer[8].Layer[0].Dimension[0].default;
		
		let objectMaxTime = new Date(stringMaxTime);
		
		// Min and Max values in HTML select for Date and Time, in file ol-map.components.ts
		
		radar.set('minSelectableDate', times[0].substr(0,10));
		
		radar.set('minSelectableTime', times[0].substr(11,5));
		
		radar.set('maxSelectableDate', stringMaxTime.substr(0,10));
		
		radar.set('maxSelectableTime', stringMaxTime.substr(11,5));
		
		// Actual user UTC View in radar panel, in file ol-map.components.ts

		radar.set('dateTimeActualView', objectMaxTime.toLocaleDateString('it-IT', 
		{
			timeZone: 'UTC',
			hour12: false,
			hour: 'numeric',
			minute: '2-digit',
		}
		));

      });
    let radarPoints = new VectorLayer({
      source: new VectorSource({
        url: function (extent) {
          return (
            'https://nodc.ogs.it/geoserver/Geoportal/ows' +
            '?service=WFS' +
            '&version=1.0.0' +
            '&request=GetFeature' +
            '&typeName=Geoportal:geoportal_radar' +
            '&outputFormat=application/json&srsname=EPSG:3857&' +
            'bbox=' +
            extent.join(',') +
            ',EPSG:3857'
          );
        },
        strategy: bboxStrategy,
        format: new GeoJSON(),
      }),
		style: this.styleByType,
    });
	
	radarPoints.set('selectable', true);
	radarPoints.set('name', 'radarPoints');
	
    let radar = new LayerGroup({
      layers: [radarArrows, radarPoints],
    });
    radar.set(
      'legendUrl',
      (radarArrows.getSource() as TileWMS).getLegendUrl(undefined, {
        COLORBARONLY: true,
		PALETTE: 'x-Rainbow',
        WIDTH: 25,
        HEIGHT: 150,
      })
    );

	radar.set('defaultLegendRange', [0, 0.5]);
	radar.set('legendRange', radar.get('defaultLegendRange'));
    radar.set('legendUnit', 'm/s');
    radar.set('name', 'Radar');
	radar.setVisible(false);
    this.layers.push(radar);

    let emodnetPoints = new VectorLayer({
      source: new VectorSource({
        url: function (extent) {
          return (
            'https://nodc.ogs.it/geoserver/Geoportal/ows' +
            '?service=WFS' +
            '&version=1.0.0' +
            '&request=GetFeature' +
			'&typeName=Geoportal:geoportal_emodnet' +
            '&outputFormat=application/json&srsname=EPSG:3857&' +
            'bbox=' +
            extent.join(',') +
            ',EPSG:3857'
          );
        },
        strategy: bboxStrategy,
        format: new GeoJSON(),
      }),
		style: this.styleByType,
    });
    emodnetPoints.set('name', 'Sampling Stations');
    emodnetPoints.set('selectable', true);
	
	// attribute that indicates whether the layer has not yet been made visible by the user.
	// Used to show / not show loading user message (view OlMapComponent HTML file)
	emodnetPoints.set('selectableFirstTime', true);
	
	emodnetPoints.setVisible(false);
    this.layers.push(emodnetPoints);
	
	let emodnetPointsSelect = new Select({//
		layers: [emodnetPoints],
		style: this.styleByType,
	});

    emodnetPointsSelect.on('select', e => {//
		const emodnetDialogConfig = new MatDialogConfig();
		emodnetDialogConfig.disableClose = true;
		emodnetDialogConfig.backdropClass = 'transparent-backdrop';
		emodnetDialogConfig.data = e.selected[0]; //emodnetPoints features
		emodnetDialogConfig.maxHeight = 600;
		
		const emodnetModalDialog = this.matEmodnetDialog.open(EmodnetDialogComponent, emodnetDialogConfig);
		emodnetModalDialog.afterClosed().subscribe(() => {
		emodnetPointsSelect.getFeatures().clear();
		});

	});
	this.interactions.push(emodnetPointsSelect);//
	

    let stations = new VectorLayer({
      source: new VectorSource({
        url: function (extent) {
          return (
            'https://nodc.ogs.it/geoserver/Geoportal/ows' +
            '?service=WFS' +
            '&version=1.0.0' +
            '&request=GetFeature' +
            '&typeName=Geoportal:geoportal_stations' +
            '&outputFormat=application/json&srsname=EPSG:3857&' +
            'bbox=' +
            extent.join(',') +
            ',EPSG:3857'
          );
        },
        strategy: bboxStrategy,
        format: new GeoJSON(),
      }),
      style: this.styleByType,//
    });
    stations.set('name', 'Real Time Stations');
    stations.set('selectable', true);
    this.layers.push(stations);

    let stationsSelect = new Select({
      layers: [stations],
      style: this.styleByType,
    });
    stationsSelect.on('select', e => {
		const dialogConfig = new MatDialogConfig();
		dialogConfig.disableClose = true;
		dialogConfig.backdropClass = 'transparent-backdrop';
		dialogConfig.data = e.selected[0]; //station features
		dialogConfig.maxHeight = 600;
		
		// If station status is inactive
		// notify this through user alert,
		// and ask to the user if he want
		// to open the dialog in every case.
		
		let stationStatus = this.erdappService.getSingleStationStatus(e.selected[0].get('name'));
		
		let openDialogWindow = true;
		
		if (stationStatus == '0')
		{
			let userMessage = e.selected[0].get('name') + " " + e.selected[0].get('type_name') + " is NOT ACTIVE.\n\n";
			
			userMessage += "Data in following dialog window could not be available.\n\n";
			
			userMessage += "Do you want to open dialog window ?";
			
			openDialogWindow = confirm (userMessage);

		}

		// Dialog is open if
		// - stationStatus is active
		// - stationStatus is undefined
		// - stationStatus is inactive but user want to open the dialog window.
		// In any case is necessary to clear layer features.

		if ((stationStatus == "1") || (stationStatus == undefined) || (openDialogWindow == true))
		{
			const modalDialog = this.matDialog.open(DetailDialogComponent, dialogConfig);
			modalDialog.afterClosed().subscribe(() => {
			stationsSelect.getFeatures().clear();
			});
			
		}
		else
			stationsSelect.getFeatures().clear();

    });
    this.interactions.push(stationsSelect);

  }
  
	// -------------------------------------
	
	// Function to return array of emodnetPoints (Sampling Stations)
	// having same geographic coordinates.
	// Input paramters:
	//	- selectedLat (number)
	//	- selectedLon (number)
	// Output:
	//	- array of string array, structured like ['Station', 'Cruise', 'LOCAL_CDI', 'ERDDAP'].
	// Called in OlMap Component, emodnet-dialog Component and emodnet-info Component.ts to determine if and what stations have same coordinates.

	getEmodnetPtsSameCoord (selectedLat:number, selectedLon:number) : string[][]
	{
		let result:string[][] = [];
		
		let counterResult = 0;

		// Pointer to Sampling Stations
		let emodnetObjPtr = this.layers.find (item=>item.get('name') == "Sampling Stations");

		// Scan, as VectorSource object, on Sampling Stations features
		(emodnetObjPtr!.get("source") as VectorSource).forEachFeature(item=>
			{
                if ((item.get("latitude") == selectedLat) && (item.get("longitude") == selectedLon))
					result[counterResult++] = [item.get("Station"), item.get("Cruise"), item.get("LOCAL_CDI"), item.get("ERDDAP")];
            });
		return result;
	} // end function
  
  
	// -------------------------------------
  styleByType: StyleFunction = (feature: FeatureLike, resolution: number) => {
    switch (feature.get('type')) 
	{
      case 'buoy':
      case 'current':
      case 'waverider':
        return new Style({
          image: new Icon({
			src: 'assets/' + this.getSourceIcon(feature.get('type'), feature.get('name')),
            scale: 1.0,
          }),
        });
      case 'drifter':
        return new Style({
          image: new Icon({
            src: 'assets/drifter.png',
            scale: 0.5,
          }),
        });
      case 'float':
        return new Style({
          image: new Icon({
            src: 'assets/float.png',
            scale: 0.8,
          }),
        });
      case 'glider':
        return new Style({
          image: new Icon({
            src: 'assets/glider.png',
            scale: 0.8,
          }),
        });
      case 'radar':
        return new Style({
          image: new Icon({
            src: 'assets/radar.png',
            scale: 1.0,
          }),
        });
      case 'station'://
        return new Style({
          image: new Icon({
            src: 'assets/emodnet_point.png',
            scale: 0.5,
          }),
        });
      default:
        return undefined;
    }
	
  };
  
	// -------------------------------------------------

	// Function to return icon for every station on the map,
	// only for these categories:
	// - Meteo marine station (buoy.png icon);
	// - Datawell waverider (station.png icon);
	// - River current meter (sea_level.png icon);
	// If stationStatus is undefined, icons returned
	// are those descripted, otherwise
	// icons are the correspondent version "green" or "red" .png file,
	// to symbolize active or inactive station status.
  
	getSourceIcon (stationType:string, stationName:string) : string | undefined
	{
		let result = undefined;
		
		let stationStatus = this.erdappService.getSingleStationStatus(stationName);

		switch (stationType)
		{
			case 'buoy':
				result = (stationStatus != undefined) ? ((stationStatus == '1') ? "buoy_green.png" : "buoy_red.png") : "buoy.png";
				
				break;

			
			case 'current':
				result = (stationStatus != undefined) ? ((stationStatus == '1') ? "sea_level_green.png" : "sea_level_red.png") : "sea_level.png";
				
				break;

			
			case 'waverider':
				result = (stationStatus != undefined) ? ((stationStatus == '1') ? "station_green.png" : "station_red.png") : "station.png";
			
				break;
		  
			default:
				break;
		}

		return result;
		
	} // end function
	
	// -------------------------------------------------

	getArgoTrejectory(type: string, id: number): Observable<Feature<Geometry>> {
		let url = 'http://maosapi.ogs.it/v0.1/trajectory?' + 'type=' + type + '&id=' + id;
		return this.http.get(url).pipe(
			map((result: any) => {
			let feature = new GeoJSON({ featureProjection: 'EPSG:3857' }).readFeatures(result)[0];
			feature.setId(id);
			return feature;
			})
		);
	}

	// Function to set Radar Date and Time 
	// in Radar panel, like chosen by user.
	// Use updateParams native function in TileWMS.
	// Input: date and time string
  
  	setLayerRadarDateTime(my_dateTime:string)
	{
		
		// - Pointer to layer named "Radar"
		let radarObjPtr = this.layers.find (item=>item.get('name') == "Radar");

		// - Pointer to layer named "RadarArrows"
		let radarArrowsObjPtr = (radarObjPtr!.get('layers').getArray()).find ((item:any)=>item.get('name') == "radarArrows");
		
		this.tileLoadingError = false;
		
		(radarArrowsObjPtr.getSource() as TileWMS).updateParams(
		{
			TIME: my_dateTime,
		});
	  
	} // end function	  
  
} // end class
