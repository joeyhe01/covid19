import { Component, Input, ViewChild, OnInit, AfterViewInit, OnChanges, SimpleChanges, EventEmitter, Output } from '@angular/core';
import { DailyMaxItems, DailyMaxItem } from '../../entity/daily_max.entity';
import { DemoService } from '../../services/demo.service';
import { MapComponent } from 'src/app/shared/comps/map/map.component';

@Component({
    selector: 'app-map-view',
    templateUrl: './map_view.component.html',
    styleUrls: ['./map_view.component.scss'],
})
export class MapViewComponent {

    @Input() dailyMaxItems: DailyMaxItems; //this is for whole country data
    @Output() onCountrySelected: EventEmitter<any> = new EventEmitter();
    @ViewChild(MapComponent,  {static: false}) mapComponent: MapComponent;
    constructor(private demoService: DemoService) {}

    onCountryClick(e) {
        this.dailyMaxItems.selectedItem = e.target.feature.properties.dailyMaxItem;
        this.onCountrySelected.emit();
        this.demoService.getProvinceDailyRor(this.dailyMaxItems.selectedItem.countrySlug).subscribe( (dailyMaxItems: DailyMaxItems) => {
            this.dailyMaxItems = dailyMaxItems;
        });
    }

    onGoHome() {
        this.demoService.getCountryDaily().subscribe((result: DailyMaxItems) => {
            this.dailyMaxItems = result;
        });
    }

    set selectedMaxDailyItem(dailyMaxItem: DailyMaxItem) {
        this.dailyMaxItems.selectedItem = dailyMaxItem;
        this.mapComponent.selectedCountryName = dailyMaxItem.countryName;
        this.demoService.getProvinceDailyRor(dailyMaxItem.countrySlug).subscribe( (dailyMaxItems: DailyMaxItems) => {
            this.dailyMaxItems = dailyMaxItems;
        });
    }
}
