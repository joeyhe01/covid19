import { Component, ViewChild } from '@angular/core';
import { DemoService } from '../services/demo.service';
import { DailyMaxItems, DailyMaxItem, ENTITYTYPE } from '../entity/daily_max.entity';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { DetailViewComponent } from './comps/detail_view.component';

@Component({
  templateUrl: './demo.component.html',
  styleUrls: ['./demo.component.scss']
})
export class DemoComponent {

  dailyMaxItems: DailyMaxItems;
  dailyStats: DailyMaxItems[];
  showType: string;
  pageSize = 10;
  page = 1;

  countrySlug: string;
  provinceSlug: string;
  cityName: string;
  showDetailButton: boolean;
  showReturnButton: boolean;

  @ViewChild(DetailViewComponent, { static: false }) dataViewComponent: DetailViewComponent;

  constructor(private activatedRoute: ActivatedRoute, private demoService: DemoService, private router: Router) {
    this.activatedRoute.params.subscribe((params: Params) => {

      this.showType = ENTITYTYPE.COUNTRY;
      this.showDetailButton = true;
      this.showReturnButton = false;
      if (params.province) {
        this.showType = ENTITYTYPE.CITY;
        this.provinceSlug = params.province;
        this.countrySlug = params.country;
        this.showDetailButton = false;
        this.showReturnButton = true;
      }
      else if (params.country) {
        this.showType = ENTITYTYPE.PROVINCE;
        this.countrySlug = params.country;
        this.showReturnButton = true;
      }
      this._retrieveData();
    });
  }

  _retrieveData() {
    if (this.showType === ENTITYTYPE.COUNTRY) {
      this.demoService.getCountryDaily().subscribe((result: DailyMaxItems) => {
        this.dailyMaxItems = result;
      });
    } else if (this.showType === ENTITYTYPE.PROVINCE) {
      this.demoService.getProvinceDailyRor(this.countrySlug).subscribe((result: DailyMaxItems) => {
        this.dailyMaxItems = result;
      });
    } else if (this.showType === ENTITYTYPE.CITY) {
      this.demoService.getCityDailyRor(this.countrySlug, this.provinceSlug).subscribe((result: DailyMaxItems) => {
        this.dailyMaxItems = result;
      });
    }
  }
  onGoHome() {
    this.demoService.getCountryDaily().subscribe((result: DailyMaxItems) => {
      this.dailyMaxItems = result;
    });
  }
  itemSelected() {
    //item selected here
    if (this.dataViewComponent) {
      this.dataViewComponent.selectedMaxDailyItem = this.dailyMaxItems.selectedItem;

    }
    if (this.showType == ENTITYTYPE.COUNTRY){
      this.demoService.getCountryProgression(this.dailyMaxItems.selectedItem.countrySlug).subscribe((data: any) => {
        this.dailyStats = [data, data];
      });
    }
    else if (this.showType == ENTITYTYPE.PROVINCE){
      this.demoService.getProvinceProgression(this.dailyMaxItems.selectedItem.countrySlug, this.dailyMaxItems.selectedItem.provinceSlug).subscribe((data: any) => {
        this.dailyStats = [data, data];
      });
    }else {
      this.demoService.getCityProgression(this.dailyMaxItems.selectedItem.countrySlug, this.dailyMaxItems.selectedItem.provinceSlug, this.dailyMaxItems.selectedItem.cityCode).subscribe((data: any) => {
        this.dailyStats = [data, data];
    });
    }

  }

  detail() {
    if (this.showType === ENTITYTYPE.COUNTRY) {
      this.router.navigate([`demo/${this.dailyMaxItems.selectedItem.countrySlug}`]);
    }
    if (this.showType === ENTITYTYPE.PROVINCE) {
      this.router.navigate([`demo/${this.dailyMaxItems.selectedItem.countrySlug}/${this.dailyMaxItems.selectedItem.provinceSlug}`]);
    }
  }
  return() {
    if (this.showType === ENTITYTYPE.CITY) {
      this.router.navigate([`demo/${this.dailyMaxItems.selectedItem.countrySlug}`]);
    }
    if (this.showType === ENTITYTYPE.PROVINCE) {
      this.router.navigate([`demo/`]);
    }
  }
}
