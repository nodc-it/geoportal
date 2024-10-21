import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { OlMapComponent } from './ol-map/ol-map.component';
import { LayerSwitcherComponent } from './layer-switcher/layer-switcher.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DetailDialogComponent } from './detail-dialog/detail-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AttributionsDialogComponent } from './attributions-dialog/attributions-dialog.component';
import { NgxGoogleAnalyticsModule } from 'ngx-google-analytics';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { GraphsComponent } from './detail-dialog/graphs/graphs.component';
import { HighchartsChartModule } from 'highcharts-angular';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { CacheInterceptor } from './interceptors/cache.interceptor';
import { CacheService } from './services/cache.service';
import { DataTableComponent } from './detail-dialog/data-table/data-table.component';
import { InfoComponent } from './detail-dialog/info/info.component';

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
    MatCheckboxModule,
    FormsModule,
  ],
  providers: [CacheService, { provide: HTTP_INTERCEPTORS, useClass: CacheInterceptor, multi: true }],
  bootstrap: [AppComponent],
})
export class AppModule {}
