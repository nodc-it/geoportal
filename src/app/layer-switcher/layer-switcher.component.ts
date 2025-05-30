import { Component } from '@angular/core';
import { MatRadioChange } from '@angular/material/radio';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import BaseLayer from 'ol/layer/Base';
import { LayersService } from '../services/layers.service';
import { ErddapService } from 'src/app/services/erddap.service';

@Component({
  selector: 'app-layer-switcher',
  templateUrl: './layer-switcher.component.html',
  styleUrls: ['./layer-switcher.component.scss'],
})
export class LayerSwitcherComponent {
  layers: BaseLayer[];
  isCollapsed: boolean = false;

  constructor(service: LayersService, public erdappService: ErddapService) {
    this.layers = service.layers;
  }

  onChange(event: MatSlideToggleChange, index: number): void {
    this.layers[index].setVisible(event.checked);
	if (this.layers[index].get('name') == "Real Time Stations")
	{
		var divCircle = document.getElementById('idActiveStationLegend') as HTMLElement;
		divCircle.hidden = !event.checked;
	}
  }

  onChangeBaseLayer(event: MatRadioChange): void {
    this.layers.filter(this.isBaseLayer).forEach(element => {
      element.setVisible(false);
    });
    this.layers[event.value].setVisible(event.source.checked);
  }

  isBaseLayer(layer: BaseLayer): boolean {
    return layer.get('base');
  }
}
