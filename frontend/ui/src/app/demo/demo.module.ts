import { NgModule } from '@angular/core';
import { DemoComponent } from './component/demo.component';
import { DemoService } from './services/demo.service';
import { SharedModule } from '../shared/shared.module';
import { DemoRoutingModule } from './routing.module';
import { ItemsComponent } from './component/comps/items.component';
import { ItemComponent } from './component/comps/item.component';
import { DetailViewComponent } from './component/comps/detail_view.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MapViewComponent } from './component/comps/map_view.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
    declarations: [
        DemoComponent, ItemsComponent, ItemComponent, DetailViewComponent, MapViewComponent],
    imports: [
        SharedModule, DemoRoutingModule, MatSortModule, MatPaginatorModule],
    exports: [DemoComponent],
    providers: [DemoService]
})
export class DemoModule { }
