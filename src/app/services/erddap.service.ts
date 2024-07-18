import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { map, mergeMap } from 'rxjs/operators';
import { DeviceParameters } from 'src/app/app.misc'; //

export interface Parameter {
  name: string;
  type: DataType;
}

export enum DataType {
  TIME_SERIES = 'TS',
  PROFILE = 'PR',
}

export enum Axis {
  T = 'T',
  X = 'X',
  Y = 'Y',
  Z = 'Z',
}

export interface Measurement {
  parameter: Parameter;
  measurement: number;
  depth: number | undefined;
  timestamp: Date;
}

export interface activeStation {
  colNames: string[];
  colTypes: string[];
  colUnits: string[];
  rowsStatus: number[][];
} 

export interface rowStation {
  name: string;
  status: string;
}


@Injectable({
  providedIn: 'root',
})
export class ErddapService {
  constructor(private http: HttpClient) {
	  this.erddapStationsStatusList = [];
  }
  
  erddapStationsStatusList:rowStation[];

  getMeasurements(
    dataset: string,
    parameter: Parameter,
    depth: number | undefined,
    timeStart: Date,
    timeEnd?: Date
  ): Observable<Measurement[]> {
    let url =
      environment.erddapUrl +
      'tabledap/' +
      dataset +
      '_' +
      parameter.type +
      '.json?' +
      'time' +
      ',' +
      parameter.name +
      (depth !== undefined ? ',depth' : '') +
      '&' +
      parameter.name +
      '_QC=~"[0-2]"' +
      '&time>=' +
      timeStart.toISOString() +
      (timeEnd != null ? '&time<=' + timeEnd.toISOString() : '') +
      '&' +
      parameter.name +
      '!=NaN' +
      (depth !== undefined ? '&depth=' + depth : '') +
      '&orderBy("time")';

    return this.http.get(url).pipe(
      map((result: any) => {
        let measurements = new Array<Measurement>();
        result.table.rows.forEach((row: any) => {
          measurements.push({
            parameter: {
              name: result.table.columnNames[1],
              type: parameter.type,
            },
            measurement: row[1],
            depth: depth !== undefined ? row[2] : undefined,
            timestamp: row[0],
          });
        });
        return measurements;
      })
    );
  }

  getLastMeasurements(
    dataset: string,
    parameter: Parameter,
    timeStart: Date,
    timeEnd?: Date
  ): Observable<Measurement[]> {

    return this.getAxisParameterName(dataset, parameter.type, Axis.Z).pipe(
      mergeMap(axisResult => {
        let url =
          environment.erddapUrl +
          'tabledap/' +
          dataset +
          '_' +
          parameter.type +
          '.json?' +
          'time' +
          ',' +
          parameter.name +
          (axisResult !== undefined && axisResult.name === 'depth' ? ',depth' : '') +
          '&' +
          parameter.name +
          '_QC=~"[0-2]"' +
          '&time>=' +
          timeStart.toISOString() +
          (timeEnd != null ? '&time<=' + timeEnd.toISOString() : '') +
          '&' +
          parameter.name +
          '!=NaN' +
          '&orderByMax("' +
          (axisResult !== undefined && axisResult.name === 'depth' ? 'depth,' : '') +
          'time")';

        return this.http.get(url).pipe(
          map((result: any) => {
            return result.table.rows.map((row: any[]) => {
              return {
                parameter: {
                  name: result.table.columnNames[1],
                  type: parameter.type,
                },
                measurement: row[1],
                depth: axisResult !== undefined && axisResult.name === 'depth' ? row[2] : undefined,
                timestamp: row[0],
              } as Measurement;
            });
          })
        );
      })
    );
  }

  getDepth(dataset: string, parameter: Parameter, timeStart: Date, timeEnd?: Date): Observable<number[] | undefined> {
    let url =
      environment.erddapUrl +
      'tabledap/' +
      dataset +
      '_' +
      parameter.type +
      '.json?' +
      'depth' +
      '&time>=' +
      timeStart.toISOString();

    if (timeEnd != null) url += '&time<=' + timeEnd.toISOString();

    url += '&' + parameter.name + '!=NaN';
    url += '&' + parameter.name + '_QC=~"[0-2]"';
    url += '&orderBy("depth")';
    url += '&distinct()';
    return this.http.get(url).pipe(
      map((result: any) => {
        return result.table.rows.map((row: number[]) => row[0]);
      })
    );
  }

  getAxisLayers(
    dataset: string,
    parameter: Parameter,
    timeStart: Date,
    timeEnd?: Date
  ): Observable<number[] | undefined> {
    return this.getAxisParameterName(dataset, parameter.type, Axis.Z).pipe(
      mergeMap(axisResult => {
        if (axisResult === undefined) return of(undefined);

        let url =
          environment.erddapUrl +
          'tabledap/' +
          dataset +
          '_' +
          parameter.type +
          '.json?' +
          axisResult.name +
          '&time>=' +
          timeStart.toISOString();

        if (timeEnd != null) url += '&time<=' + timeEnd.toISOString();

        url += '&' + parameter.name + '!=NaN';
        url += '&' + parameter.name + '_QC=~"[0-2]"';
        url += '&orderBy("' + axisResult.name + '")';
        url += '&distinct()';

        return this.http.get(url).pipe(
          map((result: any) => {
            return result.table.rows.map((row: number[]) => row[0]);
          })
        );
      })
    );
  }

  getAxisParameterName(dataset: string, dataType: DataType, axis: Axis): Observable<Parameter | undefined> {
    let url = environment.erddapUrl + 'info/' + dataset + '_' + dataType + '/index.json';

    return this.http.get(url).pipe(
      map((result: any) => {
        return (result.table.rows as string[][])
          .filter((row: string[]) => row[2] == 'axis' && row[4] == axis)
          .map((row: string[]) => {
            return { name: row[1], type: dataType } as Parameter;
          })
          .pop();
      })
    );
  }

  getMeasurementUnit(dataset: string, parameter: Parameter): Observable<string | undefined> {
    let url = environment.erddapUrl + 'info/' + dataset + '_' + parameter.type + '/index.json';

    return this.http.get(url).pipe(
      map((result: any) => {
        return (result.table.rows as string[][])
          .filter((row: string[]) => row[1] == parameter.name && row[2] == 'units')
          .map((row: string[]) => {
            return row[4];
          })
          .pop();
      })
    );
  }

	//----------------------------------------------

	// Function to get Station Status from Erddap server
	// Return an Observable structured like an activeStation interface.
	// Example:
	// {
	//	colNames: ["MAMBO1", "MAMBO2", "MAMBO3", "MAMBO4", "DWRG1", "DWRG2", "DWRG3", 'E2M3A', 'CURRISO', 'PIEZTAG'],
	//	colTypes: ['','','','','','','','','',''],
	//	colUnits: ['','','','','','','','','',''],
	//	rowsStatus: [[1,0,0,0,1,1,1,0,0,0]],
	//  } as activeStation;

	getHttpStationStatus (): Observable<activeStation>
	{
		// get station list from assets config file
		// and build string to compose url request
		
		let stationList = (DeviceParameters.getDeviceList()).join("%2C");

		// get json response
		let url = environment.erddapUrl + "tabledap/ACTIVE_STATIONS.json?" + stationList;

		return this.http.get(url).pipe(
		  map((result: any) => {

			return {
				colNames: result.table.columnNames,
				colTypes: result.table.columnTypes,
				colUnits: result.table.columnUnits,
				rowsStatus: result.table.rows,
			  } as activeStation;
			
		  })
		);
	  
	} // end function


	//----------------------------------------------


	// Function to convert station status obtained from
	// call to erddap server, in a rowStation array object
	// structured like rowStation interface.
	// Example :
	/*
	[
		{ name: 'MAMBO1', status: '1' },
		{ name: 'MAMBO2', status: '0' },
		{ name: 'MAMBO3', status: '0' },
		{ name: 'MAMBO4', status: '0' },
		{ name: 'DWRG1', status: '1' },
		{ name: 'DWRG2', status: '1' },
		{ name: 'DWRG3', status: '1' },
		{ name: 'E2M3A', status: '0'},
		{ name: 'CURRISO', status: '0' },
		{ name: 'PIEZTAG', status: '0'}
	];
	*/
	// Set the erddapStationsStatusList class attribute
	// to store all station status and return that as response.
	// If no response from erddap server, function error ()
	// will handle with user message.
  
	getAllStationStatus ():rowStation[]
	{

		this.getHttpStationStatus()!.subscribe
		((data: activeStation) =>{

			for (let index = 0;index < data!.colNames.length; index++)
			{
				// Set the erddapStationsStatusList class attribute
				
				this.erddapStationsStatusList.push(
					{
						name: data!.colNames[index],
						status: String(data!.rowsStatus[0][index]),
						
					} as rowStation
				);

			}

		},
          (error: any) => {
			
			//alert("Station status color not available in this moment.");
          }
			
		); // end subscribe

		return this.erddapStationsStatusList;

	} // end function
	
	//----------------------------------------------

	// Function to get single station(device) status
	// obtained scanning erddapStationsStatusList class attribute
	// only if erddapStationsStatusList is not empty.
	// Called by layer.service stationsSelect.

	getSingleStationStatus (device:string):string | undefined
	{
		let myStatus = undefined;
		
		if (this.erddapStationsStatusList.length != 0)
			myStatus = (this.erddapStationsStatusList.find(({ name }) => name === device))!.status;

		return myStatus;
	}

  
} // end class
