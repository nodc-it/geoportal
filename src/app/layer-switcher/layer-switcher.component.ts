import { Component, OnInit } from '@angular/core';
import { MatLegacyRadioChange as MatRadioChange } from '@angular/material/legacy-radio';
import { MatLegacySlideToggleChange as MatSlideToggleChange } from '@angular/material/legacy-slide-toggle';
import BaseLayer from 'ol/layer/Base';
import { LayersService } from '../services/layers.service';
import { ErddapService } from 'src/app/services/erddap.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
  selector: 'app-layer-switcher',
  templateUrl: './layer-switcher.component.html',
  styleUrls: ['./layer-switcher.component.scss'],
})
export class LayerSwitcherComponent implements OnInit {
  layers: BaseLayer[];
  isCollapsed: boolean = false;

  isDropupOpen = false;
  focusedItemIndex = -1;
  
  // List of real metadata (elements in "Data comparison").
  dropupItems: string[] = [];

  // Trace the selected items marked with a checkmark (now only 1 choice is possible)
  selectedMetadata = new Set<string>();

  // Check the visibility of the metadata (Data comparison) block.
  showMetadata: boolean = false; 

  constructor(public service: LayersService, public erdappService: ErddapService, private breakpointObserver: BreakpointObserver) {
    this.layers = service.layers;
	
	// Extracts the keys from the service for HTML.
	this.dropupItems = Object.keys(this.service.metadataSensorMapping);	
  }
	
	ngOnInit(): void 
	{
		// 1. Automatic device detection via BreakpointObserver
		this.breakpointObserver.observe([Breakpoints.Handset, Breakpoints.Tablet]).subscribe(result =>
		{
			if(!result.matches)
				this.isCollapsed = false;
			else
				this.isCollapsed = true;
		});

		// 2. LOAD-TIME CHECK: Check if "Real Time Stations" is already active by default.
		if (this.layers && this.layers.length > 0) {
			const rtLayer = this.layers.find(layer => layer.get('name') === "Real Time Stations");
			if (rtLayer) {
				this.showMetadata = rtLayer.getVisible();
			}
		}
	} // end ngOnInit    
	

	onChange(event: MatSlideToggleChange, index: number): void {
	  this.layers[index].setVisible(event.checked);

	  if (this.layers[index].get('name') === "Real Time Stations") {
		const divCircle = document.getElementById('idActiveStationLegend') as HTMLElement;
		if (divCircle) {
		  divCircle.hidden = !event.checked;
		}

		// Show the Metadata menu (Data comparison) only if the Real Time Stations layer is active.
		this.showMetadata = event.checked;

		if (!event.checked) {
		  // The layer has been turned off: hiding the tooltips on the map....
		  this.service.setActiveMetadata(null);
		  this.closeDropup();
		  
		} else {
		  // The layer has been turned back on: if a sensor was previously selected, we reactivate it.
		  if (this.selectedMetadata.size > 0) {
			// Let's retrieve the single element present in the exclusive selection set.
			const savedMetadata = Array.from(this.selectedMetadata)[0];
			this.service.setActiveMetadata(savedMetadata);
		  }
		}
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

  toggleDropup(): void {
    this.isDropupOpen = !this.isDropupOpen;
    if (!this.isDropupOpen) {
      this.focusedItemIndex = -1;
    }
  }

  closeDropup(): void {
    this.isDropupOpen = false;
    this.focusedItemIndex = -1;
  }


	selectItem(item: string): void {
	  if (this.selectedMetadata.has(item)) {
		// If it was already selected, clear everything (no active tooltip)
		this.selectedMetadata.clear();
		this.service.setActiveMetadata(null);
	  } else {
		// Exclusive selection
		this.selectedMetadata.clear();
		this.selectedMetadata.add(item);
		// Communicate the name of the active metadata, chosen in "Data comparison" menù (e.g., 'Oxygen') to the service.
		this.service.setActiveMetadata(item);
	  }
	}


	// Function to navigate Data comparison menù with keyboard
	
	handleKeyDown(event: KeyboardEvent): void
	{
		// The total count now corresponds exactly to the number of actual metadata items.
		const totalItemsCount = this.dropupItems.length;

		if (!this.isDropupOpen) {
		if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowUp') {
		  event.preventDefault();
		  this.isDropupOpen = true;
		  this.focusedItemIndex = 0;
		  this.focusDropdownItem();
		}
		return;
		}

		switch (event.key)
		{
			case 'Escape':
			  event.preventDefault();
			  this.closeDropup();
			  const trigger = document.getElementById('menuTrigger');
			  if (trigger) trigger.focus();
			  break;
			case 'ArrowDown':
			  event.preventDefault();
			  this.focusedItemIndex = (this.focusedItemIndex + 1) % totalItemsCount;
			  this.focusDropdownItem();
			  break;
			case 'ArrowUp':
			  event.preventDefault();
			  this.focusedItemIndex = this.focusedItemIndex <= 0 ? totalItemsCount - 1 : this.focusedItemIndex - 1;
			  this.focusDropdownItem();
			  break;
			case 'Tab':
			  this.closeDropup();
			  break;
		}
	} // end function



  private focusDropdownItem(): void {
    setTimeout(() => {
      const elements = document.querySelectorAll('.dropup-item');
      if (elements && elements[this.focusedItemIndex]) {
        (elements[this.focusedItemIndex] as HTMLElement).focus();
      }
    }, 0);
  }
}
