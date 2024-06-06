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
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DateFunctions } from '../app.misc';
import Overlay from 'ol/Overlay';

@Injectable({
  providedIn: 'root',
})
export class LayersService {
  layers: BaseLayer[] = [];
  interactions: Interaction[] = defaults().getArray();

  constructor(private http: HttpClient, private matDialog: MatDialog) {
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
      style: new Style({
        image: new Icon({
          src: 'assets/radar.png',
          scale: 1.0,
        }),
      }),
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
      style: this.styleByType,
    });
    stations.set('name', 'Stations');
    stations.set('selectable', true);
    this.layers.push(stations);

    let stationsSelect = new Select({
      layers: [stations],
      style: this.styleByType,
    });
    stationsSelect.on('select', e => {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.disableClose = false;
      dialogConfig.data = e.selected[0];
	  dialogConfig.maxHeight = 600;
      const modalDialog = this.matDialog.open(DetailDialogComponent, dialogConfig);
      modalDialog.afterClosed().subscribe(() => {
        stationsSelect.getFeatures().clear();
      });
    });
    this.interactions.push(stationsSelect);
  }

  styleByType: StyleFunction = (feature: FeatureLike, resolution: number) => {
    switch (feature.get('type')) {
      case 'buoy':
        return new Style({
          image: new Icon({
            src: 'assets/buoy.png',
            scale: 1.0,
          }),
        });
      case 'current':
        return new Style({
          image: new Icon({
            src: 'assets/sea_level.png',
            scale: 1.0,
          }),
        });
      case 'waverider':
        return new Style({
          image: new Icon({
            src: 'assets/station.png',
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
            scale: 0.5,
          }),
        });
      default:
        return undefined;
    }
  };

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
