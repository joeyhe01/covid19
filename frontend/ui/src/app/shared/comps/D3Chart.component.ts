import { AfterViewInit, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import * as c3 from 'c3';
import { DailyMaxItems } from 'src/app/demo/entity/daily_max.entity';
@Component({
    selector: 'app-d3-chart',
    templateUrl: './D3Chart.component.html',
    styleUrls: ['./D3Chart.component.scss'],
})
export class D3ChartComponent implements AfterViewInit {
    @Input() public data; // [daily, growth]
    @Input() public xTicks;
    public chart;
    public ngAfterViewInit() {
        // https://c3js.org/samples/axes_x_tick_values.html
        const columnData = [];
        columnData.push(['x'].concat(this.xTicks));

        const dailyStats = this.data[0].graphData;
        const dailyGrowth = this.data[1].growthData;

        dailyStats.forEach((arr) => {
            columnData.push(arr);
        });
        dailyGrowth.forEach((arr) => {
            columnData.push(arr);
        });
        this.chart = c3.generate({
            bindto: '.myChart',
            data: {
                x: 'x',
                columns: columnData,
                axes: {
                    Confirmed: 'y',
                    Active: 'y',
                    Deaths: 'y',
                    Recovered: 'y',
                    'Daily Confirmed': 'y2',
                    'Daily Active': 'y2',
                    'Daily Deaths': 'y2',
                    'Daily Recovered': 'y2',
                },
                // type: 'spline',
            },
            axis: {
                x: {
                    type: 'timeseries',
                    tick: {
                        values: this.xTicks,
                    },
                },
                y: {
                    label: 'Total Count',
                },
                y2: {
                    label: 'Daily Growth',
                    show: true,
                },
            },
            point: {
                r: 0,
            },
        });
    }

    public updateChart(dailyMaxItems: DailyMaxItems[]) {

        const columnData = [];
        columnData.push(['x'].concat(dailyMaxItems[0].dates));
        dailyMaxItems[0].graphData.forEach((arr) => {
            columnData.push(arr);
        });
        dailyMaxItems[1].growthData.forEach((arr) => {
            columnData.push(arr);
        });
        this.chart.load({
            columns: columnData,
        });
    }
    //
    // ngOnChanges(changes: SimpleChanges) {
    //     if (
    //         'data' in changes &&
    //         !changes.data.firstChange &&
    //         changes.data.currentValue !==
    //         changes.data.previousValue
    //     ) {
    //         const columnData = [];
    //         columnData.push(['x'].concat(this.xTicks));
    //         changes.data.currentValue.forEach(arr => {
    //             columnData.push(arr);
    //         });
    //         this.chart.load({
    //             columns: columnData
    //         });
    //
    //     }
    //
    // }

}
