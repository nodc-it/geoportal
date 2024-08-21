//import { Component, Input, OnInit } from '@angular/core';
import { Component, Input, OnInit, ViewChild } from '@angular/core'; //
import * as Highcharts from 'highcharts/highstock';
import { DataType, ErddapService, Parameter, Measurement } from 'src/app/services/erddap.service';
import { Options } from 'highcharts';
import Collection from 'ol/Collection';
import Feature from 'ol/Feature';
import Geometry from 'ol/geom/Geometry';
import { MatPaginator } from '@angular/material/paginator'; //
import { VocabService } from '../../services/vocab.service';
import HC_exporting from 'highcharts/modules/exporting';
import HC_exportdata from 'highcharts/modules/export-data';
import { DateFunctions } from 'src/app/app.misc';
import { DeviceParameters } from 'src/app/app.misc';
HC_exporting(Highcharts);
HC_exportdata(Highcharts);

interface TimeSeries {
  parameter: Parameter;
  series: {
    depth: number | undefined;
    selected: boolean;
  }[];
}

@Component({
  selector: 'app-graphs',
  templateUrl: './graphs.component.html',
  styleUrls: ['./graphs.component.scss'],
})
export class GraphsComponent implements OnInit {
  @ViewChild(MatPaginator)
  paginator!: MatPaginator;//
	
  Highcharts: typeof Highcharts = Highcharts;
  updateFlag = false;
  loading = 0;
  chartRef!: Highcharts.Chart;
  timeseries: TimeSeries[] = [];
  timeseriesLoaded!: Promise<boolean>;
  chartCallback: Highcharts.ChartCallbackFunction = chart => {
    this.chartRef = chart;
  };

  allSelected(timeseries: TimeSeries) {
    return timeseries.series != null && timeseries.series.every(s => s.selected);
  }
  someSelected(timeseries: TimeSeries): boolean { 
    return timeseries.series != null && timeseries.series.some(s => s.selected) && !this.allSelected(timeseries);
  }
  selectAll(selected: boolean, timeseries: TimeSeries) {
    if (timeseries.series == null) return;
    timeseries.series.forEach(s => (s.selected = selected));
  }

  updateChart() {
    this.timeseries.forEach(timeseries => {
      timeseries.series.forEach(series => {
        if (series.selected)
          if (!this.chartRef.get(timeseries.parameter.name + series.depth))
            this.addSeries(
              this.data.get('name'),
              timeseries.parameter,
              series.depth,
              DateFunctions.daysAgoMidnightUTC(120)
            );
          else (this.chartRef.get(timeseries.parameter.name + series.depth) as Highcharts.Series).show();
        else if (this.chartRef.get(timeseries.parameter.name + series.depth))
          (this.chartRef.get(timeseries.parameter.name + series.depth) as Highcharts.Series).hide();
      });
    });
  }

  @Input() data!: Collection<Feature<Geometry>>;
  chartOptions: Options;
  constructor(private erdappService: ErddapService, public vocabService: VocabService) {
    this.chartOptions = {
      title: { text: undefined },
      chart: {
        events: {
          load: event => {
            this.chartRef.showLoading('Please select one or more series');
          },
        },
      },
      time: {
        useUTC: false,
      },
      exporting: {
        buttons: {
          contextButton: {
            menuItems: ['downloadCSV', 'downloadXLS'],
          },
        },
      },

      rangeSelector: {
        enabled: true,
        buttons: [
          {
            type: 'hour',
            count: 1,
            text: '1h',
            title: 'View 1 hour',
          },
          {
            type: 'hour',
            count: 6,
            text: '6h',
            title: 'View 6 hour',
          },
          {
            type: 'day',
            count: 1,
            text: '1d',
            title: 'View 1 day',
          },
          {
            type: 'week',
            text: '1w',
            title: 'View 1 week',
          },
          {
            type: 'month',
            count: 1,
            text: '1m',
            title: 'View 1 month',
          },
          {
            type: 'month',
            count: 4,
            text: '4m',
            title: 'View 4 months',
          },
        ],
      },
      navigator: {
        enabled: true,
      },
      scrollbar: {
        enabled: true,
      },
      legend: {
        enabled: false,
      },
      xAxis: {
        ordinal: false,
        type: 'datetime',
        title: {
          text: undefined,
        },
        crosshair: true,
      },
      yAxis: {
        title: {
          text: undefined,
        },
      },
      tooltip: {
        split: true,
      },
      plotOptions: {
        line: {
          marker: { enabled: false },
        },
      },
      series: [],
    };
  }

  ngOnInit(): void {
    this.getTimeSeriesAvailable(this.data.get('name'), DateFunctions.daysAgoMidnightUTC(120));
  }

  getTimeSeriesAvailable(dataset: string, timeStart: Date, timeEnd?: Date) {
    //let dialogParam = this.data.get('dialog_par').split(',');
	//alert("graphs.component.ts - getTimeSeriesAvailable");//
	let dialogParam = (DeviceParameters.getSensorDialogPar(this.data.get('name')));
    dialogParam.map((param: string) => {
      this.loading++;
      this.erdappService
        .getAxisLayers(dataset, { name: param, type: DataType.TIME_SERIES }, timeStart, timeEnd)
        .subscribe(
          (response: number[] | undefined) => {
            this.timeseries = this.timeseries.concat({
              parameter: { name: param, type: DataType.TIME_SERIES },
              series:
                response !== undefined
                  ? response.map(depth => {
                      return { depth: depth, selected: false };
                    })
                  : [{ depth: undefined, selected: false }],
            });
            this.timeseries.sort(
              (a, b) => dialogParam.indexOf(a.parameter.name) - dialogParam.indexOf(b.parameter.name)
            );
            this.timeseriesLoaded = Promise.resolve(true);
          },
          (error: any) => {
            this.loading--;
            console.log(error);
          },
          () => {
            this.loading--;
          }
        );
    });
  }

  addSeries(dataset: string, parameter: Parameter, depth: number | undefined, timeStart: Date, timeEnd?: Date) {
	  
    let dataArray: number[][] = [];
    this.loading++;
    this.erdappService.getMeasurements(dataset, parameter, depth, timeStart, timeEnd).subscribe(
      (response: Measurement[]) => {
        dataArray = response.map((measure: Measurement) => {
          return [new Date(measure.timestamp).getTime(), measure.measurement];
        });
        let measurementUnit = this.vocabService.getMeasurementUnit(this.data.get('name'), parameter.name);

        if (measurementUnit !== undefined && !this.chartRef.get(measurementUnit))
          this.chartRef.addAxis({
            id: measurementUnit,
            type: 'linear',
            showEmpty: false,
            title: {
              text: undefined,
            },
            opposite: true,
            labels: {
              format: '{value} ' + measurementUnit,
            },
          });
        if (!this.chartRef.get(parameter.name + depth))
          // per evitare bug con selezioni multiple veloci
          this.chartRef.addSeries({
            id: parameter.name + depth,
            name: this.vocabService.getMeasurementName(this.data.get('name'), parameter.name),
            type: 'line',
            yAxis: measurementUnit,
            data: dataArray,
            showInNavigator: true,
            dataGrouping: {
              enabled: true,
            },
            tooltip: {
              valueDecimals: 2,
			  // depth added on tooltip only if is different from undefined and > 0
              valueSuffix: ' ' + measurementUnit + (((depth != undefined) && (depth > 0)) ? (' depth ' + depth + ' m') : ''),
            },
          });
        else (this.chartRef.get(parameter.name + depth) as Highcharts.Series).show(); // stessa cosa di sopra
      },
      (error: any) => {
        this.loading--;
        this.chartRef.hideLoading();
        console.log(error);
      },
      () => {
        this.updateFlag = true;
        this.loading--;
        this.chartRef.hideLoading();
      }
    );
    return dataArray;
  }
}
