import configStationJsonFile from '../assets/config_stations.json';
import configMapJsonFile from '../assets/config_map_view.json';

export abstract class DateFunctions {
  static daysElapsed(timestamp: string): number {
    return (Date.now() - Date.parse(timestamp)) / (1000 * 60 * 60 * 24);
  }

  static midnightUTC(): Date {
    let date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }

  static daysAgoMidnightUTC(days: number): Date {
    let date = this.midnightUTC();
    date.setDate(date.getDate() - days);
    return date;
  }
}

// USED IN findMetadata function
// ---------------------------------
// Interface for file JSON GeoJSON typing
export interface FeatureProperties {
  name: string;
  dialog_par: string[];
}

export interface Feature {
  properties: FeatureProperties;
  [key: string]: any; // for other properties like geometry, type, ecc.
}

export interface GeoJsonInput {
  type: string;
  features: Feature[];
  [key: string]: any;
}

// Return value type: array of [string, string] pairs
export type RespondingPair = [string, string];
// ---------------------------------


// Interface describing data stored
// in config_map_view.json local file,
// used to set map view in ol-map.component.ts.
// Every dataset describe:
// - coordinate center of the map view, in EPSG format;
// - flag to show/hide stations layers on the map;
// - flag to show/hide radar layers on the map;
// - zoom desired for the map.
// See config_map_view.json for further information.

export interface urlInfoInterface {
  coordinateCenter: number[];
  stationsYN: number;
  radarYN: number;
  zoomLevel: number;
}


export interface DataComparisonSensorRule {
  stationName: string;
  paramName: string;
  sensorId: string;
}


// Class to implement local file access
// to retrieve:
// - device parameters management from config_stations.json;
// - UrlInfo from config_map_view.json.

export abstract class DeviceParameters {
  
	// Returns the array of parameters exactly as they appear in the JSON (a mix of strings and objects)
	// to allow consumers (table and charts) to read the `sensor_id`, if present.
	
  static getSensorDialogPar(deviceName: string): any[] {
    const station = configStationJsonFile.features.find((item: any) => item.properties.name === deviceName);
    return station ? station.properties.dialog_par : [];
  } // end function

	// Returns the list of device names
  static getDeviceList(): string[] {
    let myDeviceList = [];

    for (let i = 0; i < (configStationJsonFile.features).length; i++) {
      myDeviceList.push(configStationJsonFile.features[i].properties.name);
    }
    return myDeviceList;
  } // end function
  
  
  static getComparisonSensorId(stationName: string, paramName: string): string | undefined {
    const rules: DataComparisonSensorRule[] = configStationJsonFile.data_comparison_sensor_rules || [];
    
    const rule = rules.find(
      r => r.stationName === stationName && r.paramName === paramName
    );
    return rule ? rule.sensorId : undefined;
  }  // end function


  static getMetadataSensorMapping(): { [key: string]: string[] } {
    return configStationJsonFile.metadata_sensor_mapping || {};
  } // end function


	// Function to map input parameters (sensor's name to search for) 
	// to their corresponding "name" values—the names of sea devices 
	// if these are in "dialog_par".
	// Return device-sensor pairs, provided that a given sensor is available on a specific device.
	// This function is used for tooltips within the "Data Comparison" menu item.


  static findMetadata(inputParams: string[]): RespondingPair[] {
    const result: RespondingPair[] = [];

    for (const my_parameter of inputParams) {
      for (const feature of configStationJsonFile.features) {
        const { name, dialog_par } = feature.properties;

        for (const item of dialog_par) {
          const paramName = typeof item === 'object' && item !== null ? item.param : item;

          if (paramName === my_parameter) {

            const requiredSensorId = DeviceParameters.getComparisonSensorId(name, paramName);

            if (requiredSensorId !== undefined) {
              // includes only object with the registered sensor_id
              if (typeof item === 'object' && item.sensor_id === requiredSensorId) {
                result.push([name, paramName]);
              }
              continue; 
            }

            // Standard flow for all devices without sensor_id specification
            result.push([name, paramName]);
          }
        }
      }
    }

    // remove duplicate
    const uniquePairs = result.filter((pair, index, self) =>
      index === self.findIndex((t) => t === pair)
    );

    return uniquePairs;
  } // end function
  
  // Function to return UrlInfo from local file config_map_view.json
  // where are stored information about set map view.
  // Takes in input 'msv', an URL parameter,
  // load local configuration map file
  // and return an object 'urlInfoInterface'
  // setted with required fields.
  // If mscCode is not in configuration file,
  // return undefined.
  // Function used in OlMapComponent ngOnInit.
  
  static getUrlInfo (msvCode:string):urlInfoInterface | any
  {
    // Ora utilizza l'import statico configMapJsonFile dichiarato in cima
    return {
      coordinateCenter: configMapJsonFile.urlInfoList[Number(msvCode)].urlInfo.coordCenter,
      radarYN: configMapJsonFile.urlInfoList[Number(msvCode)].urlInfo.radarYesNo,
      stationsYN: configMapJsonFile.urlInfoList[Number(msvCode)].urlInfo.stationsYesNo,
      zoomLevel: configMapJsonFile.urlInfoList[Number(msvCode)].urlInfo.zoom,
    } as urlInfoInterface;
    
  } // end function
  
} // end class
