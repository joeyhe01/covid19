import { Component, AfterViewInit, ViewChild, Output, Input, EventEmitter, OnChanges, ElementRef } from '@angular/core';

@Component({
    selector: 'app-legend',
    templateUrl: './customer_legend.component.html',
    styleUrls: ['./customer_legend.component.scss']
})
export class CustomerLegendComponent implements OnChanges {
    @Input() legends: any;
    legendKeys: string[];
    constructor() {
        setTimeout(() => {
            this.legendKeys = Object.keys(this.legends);
        }, 0);
    }

    ngOnChanges(e) {
        if (e.legends && e.legends.currentValue) {
            setTimeout(() => {
                this.updateLegends(this.legends);
            }, 0);
        }
    }
    updateLegends(legends: any) {
        this.legends = legends;
        this.legendKeys = Object.keys(this.legends);
    }
}
