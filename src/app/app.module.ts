import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { OlMapComponent } from './ol-map/ol-map.component';
import { LayerSwitcherComponent } from './layer-switcher/layer-switcher.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DetailDialogComponent } from './detail-dialog/detail-dialog.component';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacySlideToggleModule as MatSlideToggleModule } from '@angular/material/legacy-slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyRadioModule as MatRadioModule } from '@angular/material/legacy-radio';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AttributionsDialogComponent } from './attributions-dialog/attributions-dialog.component';
import { NgxGoogleAnalyticsModule } from 'ngx-google-analytics';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { GraphsComponent } from './detail-dialog/graphs/graphs.component';
import { HighchartsChartModule } from 'highcharts-angular';
import { MatLegacyPaginatorModule as MatPaginatorModule } from '@angular/material/legacy-paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table';
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs';
import { MatLegacyProgressBarModule as MatProgressBarModule } from '@angular/material/legacy-progress-bar';
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule} from '@angular/material/legacy-progress-spinner';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { FormsModule } from '@angular/forms';
import { CacheInterceptor } from './interceptors/cache.interceptor';
import { CacheService } from './services/cache.service';
import { DataTableComponent } from './detail-dialog/data-table/data-table.component';
import { InfoComponent } from './detail-dialog/info/info.component';
import { EmodnetDialogComponent } from './emodnet-dialog/emodnet-dialog.component';
import { EmodnetInfoComponent } from './emodnet-dialog/emodnet-info/emodnet-info.component';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';

import {DragDropModule} from '@angular/cdk/drag-drop';

@NgModule({
  declarations: [
    AppComponent,
    OlMapComponent,
    LayerSwitcherComponent,
    DetailDialogComponent,
    AttributionsDialogComponent,
    GraphsComponent,
    DataTableComponent,
    InfoComponent,
    EmodnetDialogComponent,
    EmodnetInfoComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatDialogModule,
    MatButtonModule,
    MatCardModule,
    MatSlideToggleModule,
    MatIconModule,
    MatToolbarModule,
    MatRadioModule,
    NgxGoogleAnalyticsModule.forRoot('G-PH2B3YQD4B'),
    HttpClientModule,
    HighchartsChartModule,
    MatTabsModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatProgressBarModule,
	MatProgressSpinnerModule,
    MatCheckboxModule,
    FormsModule,
	MatTooltipModule,
	DragDropModule
  ],
  providers: [CacheService, { provide: HTTP_INTERCEPTORS, useClass: CacheInterceptor, multi: true }],
  bootstrap: [AppComponent],
})
export class AppModule {}
