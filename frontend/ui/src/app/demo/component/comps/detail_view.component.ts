import { Component, Input, ViewChild, OnInit, AfterViewInit, OnChanges, SimpleChanges, EventEmitter, Output } from '@angular/core';
import { DailyMaxItems, DailyMaxItem } from '../../entity/daily_max.entity';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatTable } from '@angular/material/table';
import { D3ChartComponent } from 'src/app/shared/comps/D3Chart.component';
import { getDBCountryName } from 'src/app/shared/comps/map/map.service';
import { MapViewComponent } from './map_view.component';
@Component({
    selector: 'app-stat-details',
    templateUrl: './detail_view.component.html',
    styleUrls: ['./detail_view.component.scss'],
})
export class DetailViewComponent implements OnInit, AfterViewInit, OnChanges {
    @Input() dailyStats: DailyMaxItems[]; // this is for each country data
    @Input() dailyMaxItems: DailyMaxItems; //this is for whole country data

    @ViewChild(MatSort, { static: false }) sort: MatSort;
    @ViewChild(MatTable, { static: false }) table: MatTable<any>;
    @ViewChild(D3ChartComponent, { static: false }) chart: D3ChartComponent;
    @ViewChild(MapViewComponent, {static: false}) mapViewComponent: MapViewComponent;

    @Output() onCountrySelected: EventEmitter<any> = new EventEmitter();

    dataSource;
    loading = false;
    showChart = true;
    showType = 'map';
    constructor() {
      setTimeout(()=>{
        console.log(this.dailyMaxItems)
      });
    }

    displayedColumns: string[] = ['date', 'active', 'confirmed', 'deaths', 'recovered', 'dailyActiveGrowth', 'dailyConfirmedGrowth','dailyDeathGrowth', 'dailyRecoveredGrowth'];

    ngOnInit() {
        this.dataSource = new MatTableDataSource(this.dailyStats[0].dailyMaxItems);
    }

    ngAfterViewInit() {
        this.dataSource.sort = this.sort;
    }

    ngOnChanges(changes: SimpleChanges) {
        if (
            'dailyStats' in changes &&
            !changes.dailyStats.firstChange &&
            changes.dailyStats.currentValue !==
            changes.dailyStats.previousValue
        ) {
            this.chart.updateChart(changes.dailyStats.currentValue);
            this.dataSource = new MatTableDataSource(changes.dailyStats.currentValue[0].dailyMaxItems);
            this.dataSource.sort = this.sort;
        }

    }

    set selectedMaxDailyItem(dailyMaxItem: DailyMaxItem) {
        this.mapViewComponent.selectedMaxDailyItem = dailyMaxItem;
    }

}
