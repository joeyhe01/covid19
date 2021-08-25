import { Component, Input } from '@angular/core';
import { DailyMaxItem, ENTITYTYPE } from '../../entity/daily_max.entity';

@Component({
    selector: 'app-item',
    templateUrl: './item.component.html',
    styleUrls: ['./item.component.scss']
})
export class ItemComponent {
    @Input() dailyItem: DailyMaxItem;
    @Input() showType: string;

    _ENTITYTYPE = ENTITYTYPE;



}
