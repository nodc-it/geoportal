import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { OlMapComponent } from './ol-map/ol-map.component';


const routes: Routes = 
[
	// path for msv URL parameter
	// to differentiate map view
	// from real-time data page in OGS website
	{ path: 'OlMapComponent/:msv', component: OlMapComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
