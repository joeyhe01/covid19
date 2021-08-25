import { Component, AfterViewInit, Input, OnChanges, SimpleChanges, Output, EventEmitter, ElementRef } from '@angular/core';
import ReactDOM from 'react-dom';
import React from 'react';

declare var CL: any;

@Component({
    selector: 'app-data-table',
    template: `<div class="{{appId}} dvTable"></div>`,
})
export class DataTableComponent implements AfterViewInit {
    @Input() appId = 'default_data_table_id';
    @Input() config;
    @Input() data: any;
    nativeElement: any;
    constructor(el: ElementRef) {
        this.nativeElement = el.nativeElement;
    }

    ngAfterViewInit() {
        try {
            ReactDOM.unmountComponentAtNode(this.nativeElement.children[0]);
        } catch (e) {}

        ReactDOM.render(
            React.createElement(CL.default.DataTableComp, {
                appId: this.appId,
                config: this.config,
                data: this.data
            }),
            this.nativeElement.children[0]
        );
    }
}
