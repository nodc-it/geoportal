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
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DateFunctions } from '../app.misc';
import Overlay from 'ol/Overlay';
import { ErddapService } from 'src/app/services/erddap.service';

@Injectable({
  providedIn: 'root',
})
export class LayersService {
  layers: BaseLayer[] = [];
  interactions: Interaction[] = defaults().getArray();

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
        url: 'https://dsecho.ogs.it/thredds/wms/radar/NAdr-radar/aggregate.nc',
        params: {
          LAYERS: 'ewct:nsct-group',
          TILED: true,
		  STYLES: 'vector_arrows/seq-Blues',
          COLORSCALERANGE: '0, 1.25',
          ABOVEMAXCOLOR: 'extend',
          BELOWMINCOLOR: 'extend',
        },
      }),
    });
	radarArrows.set('name','radarArrows');
	
    fetch(radarArrows.getSource()!.getUrls()?.[0] + '?REQUEST=GetCapabilities&SERVICE=WMS&VERSION=1.3.0')
      .then(function (response) {
        return response.text();
      })
      .then(function (text) {
        let result = new WMSCapabilities().read(text);
        let times =
          result.Capability.Layer.Layer[0].Layer[3].Layer[0].Dimension[0].values.split(
            ','
          ); /*.find(({Name}:any)=>Name === 'ewct:nsct-group')
		  
        /*.map((layer: any) => {
          layer.filter((layer2: any)=> {

          })
        })    /*.filter((layer: any)=>{ return (typeof layer.Layer === undefined) })/*.Layer[3].Layer[0].Dimension*/

        radar.set('times', times);

		// Set low and high time interval limit in object radar attribute
		let stringInterval = (times[times.length - 1]).substr(0,49);
		
		let backSlashPos = stringInterval.indexOf('/');
		
		radar.set('timeIntervalLow', stringInterval.substr(0,10));
		
		radar.set('timeIntervalHigh', stringInterval.substr(backSlashPos+1,10));

        //console.log(times);
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
		PALETTE: 'seq-Blues',
        WIDTH: 25,
        HEIGHT: 150,
      })
    );

	radar.set('defaultLegendRange', [0, 1.25]);
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
		emodnetDialogConfig.disableClose = false;
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
		dialogConfig.disableClose = false;
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
}
