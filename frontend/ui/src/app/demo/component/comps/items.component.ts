import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DailyMaxItems, DailyMaxItem } from '../../entity/daily_max.entity';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
    selector: 'app-items-list',
    templateUrl: './items.component.html',
    styleUrls: ['./items.component.scss']
})
export class ItemsComponent {

    pageSize = 200;
    page = 1;

    @Input() dailyMaxItems: DailyMaxItems;
    @Input() showType: string;
    @Output() onItemSelected: EventEmitter<any> = new EventEmitter();
    myControl = new FormControl();
    filteredOptions: Observable<string[]>;
    options: string[] = [];

    filteredItems: DailyMaxItem[];
    constructor() {
        this.filteredItems = [];
        setTimeout(() => {
            this.select(this.dailyMaxItems.dailyMaxItems[0]);
            this.options = this.dailyMaxItems.allCountryNames;
            this.options.unshift('All');
            this.filteredOptions = this.myControl.valueChanges.pipe(
                startWith(''),
                map(value => this._filter(value))
            );
            this.filteredItems = this.dailyMaxItems.dailyMaxItems;

        });
    }
    private _filter(value: string): string[] {
        const filterValue = value.toLowerCase();
        return this.options.filter(option => option.toLowerCase().indexOf(filterValue) === 0);
    }
    optionSelected(e) {
        const foundRecords =
            this.options.filter(item => {
                return item === e.option.value;
            });
        if (foundRecords.length > 0) {
            if (foundRecords[0] === 'All') {
                this.filteredItems = this.dailyMaxItems.dailyMaxItems;
            } else {
                this.filteredItems = this.dailyMaxItems.findByCountryName(foundRecords[0]);
            }
        } else {
            this.filteredItems = this.dailyMaxItems.dailyMaxItems;
        }
    }
    detail(item) {
        console.log(item);
    }

    select(item: DailyMaxItem) {
        this.dailyMaxItems.selectedItem = item;
        this.onItemSelected.emit(item);
    }
    nextPage() {
        this.page++;
    }
    prePage() {
        if (this.page > 1) {
            this.page--;
        }
    }

}
