
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

// Class to implement device parameters management

export abstract class DeviceParameters
{
	
	// Member function to retrieve 
	// device sensor parameters shown in dialog for
	// every station clicked on the map.
	// The function download parameter's info
	// from configuration file 'config_stations.json'
	// in 'configuration' folder.
	// INPUT PARAMETER: device name (string)
	// RETURN VALUE: string array of parameters.
	
	static getSensorDialogPar (deviceName: string) : string[]
	{
		// Read configuration file from local server.
		const configStationJsonFile = require('./../assets/config_stations.json');

		let myDialogPar = [];

		// Loop on features array to search
		// device name input parameter.
		// Exit when correspondent dialog parameters
		// are founded.
		
		for (let i = 0; i < (configStationJsonFile.features).length; i++)
		{
			if (configStationJsonFile.features[i].properties.name == deviceName)
			{
				myDialogPar = (configStationJsonFile.features[i].properties.dialog_par);
				
				break;
			}
		}
		
		return myDialogPar;
		
	}

	// Member function to retrieve 
	// station (device) list
	// from configuration file 'config_stations.json'
	// in 'configuration' folder.
	// INPUT PARAMETER: device name (string)
	// RETURN VALUE: string array.

	
	static getDeviceList () : string []
	{

		// Read configuration file from local server.
		const configStationJsonFile = require('./../assets/config_stations.json');

		let myDeviceList = [];

		// Loop on features array to search
		// all device .
		
		for (let i = 0; i < (configStationJsonFile.features).length; i++)
		{
			myDeviceList.push(configStationJsonFile.features[i].properties.name);
			
		}
		
		return myDeviceList;
		
	}
}

