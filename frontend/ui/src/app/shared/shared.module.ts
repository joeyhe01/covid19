import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { D3ChartComponent } from './comps/D3Chart.component';
import { MapComponent } from './comps/map/map.component';
import { CustomMaterialModule } from './custom_material.module';

import { DataTableComponent } from './comps/data-table/data-table.component';
// import { DataTableDemoComponent } from './demo/data-table/data-table-demo.component';
import { DemoCompComponent } from './comps/demo-comp/demo-comp.component';
import { CustomerLegendComponent } from './comps/map/cusotmer_legend.component';
import { LibraryComponent } from './library.component';
import { LibraryRoutingModule } from './routing.module';

// import { DemoCompDemoComponent } from './demo/demo-comp/demo-comp-demo.component';
// import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { MatFormFieldModule, MatInputModule } from '@angular/material';
// import { MapService } from './comps/map/map.service';
// @NgModule({
//     imports: [
//         LibraryRoutingModule,
//         CommonModule,
//         HttpClientModule,
//         CustomMaterialModule,
//         FormsModule,

// import { DemoCompDemoComponent } from './demo/demo-comp/demo-comp-demo.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MapService } from './comps/map/map.service';
import { HttpRequestService } from './http_request.service';
@NgModule({
  imports: [
    LibraryRoutingModule,
    CommonModule,
    HttpClientModule,
    CustomMaterialModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  declarations: [
    LibraryComponent,
    D3ChartComponent,
    MapComponent,
    CustomerLegendComponent,
    DataTableComponent,
    // DataTableDemoComponent,
    DemoCompComponent,
    // DemoCompDemoComponent
  ],
  exports: [
    CommonModule,
    CustomMaterialModule,
    D3ChartComponent,
    MapComponent,
    DataTableComponent,
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [
    HttpRequestService,
    MapService,
  ],
})
export class SharedModule {
}
