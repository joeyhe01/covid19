import { Component, AfterViewInit, Input, OnChanges, SimpleChanges, Output, EventEmitter, ElementRef } from '@angular/core';
import ReactDOM from 'react-dom';
import React from 'react';

declare var CL: any;

@Component({
    selector: 'app-demo-comp',
    template: `<div></div>`,
})
export class DemoCompComponent implements AfterViewInit {
    nativeElement: any;
    constructor(el: ElementRef) {
        this.nativeElement = el.nativeElement;
    }

    ngAfterViewInit() {
        try {
            ReactDOM.unmountComponentAtNode(this.nativeElement.children[0]);
        } catch (e) {}

        ReactDOM.render(
            React.createElement(CL.default.AntDemoComponent),
            this.nativeElement.children[0]
        );
    }
}
