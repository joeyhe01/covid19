import { Injectable } from '@angular/core';
import { Observable, zip } from 'rxjs';
import { HttpRequestService } from 'src/app/shared/http_request.service';
import { DailyMaxItems } from '../entity/daily_max.entity';

@Injectable()
export class DemoService {
    constructor(private httpRequestService: HttpRequestService) { }

    getCountryDaily() {
        return new Observable(observer => {
            this.httpRequestService.get('daily_stat/country').subscribe(data => {
                observer.next(new DailyMaxItems(data));
            });
        });
    }

    getProvinceDailyRor(countrySlug: string) {
        return new Observable(observer => {
            this.httpRequestService.get(`daily_stat/country/${countrySlug}`).subscribe(data => {
                observer.next(new DailyMaxItems(data));
            });
        });
    }

    getCityDailyRor(countrySlug: string, provinceSlug: string) {
        return new Observable(observer => {
            this.httpRequestService.get(`daily_stat/country/${countrySlug}/${provinceSlug}`).subscribe(data => {
                observer.next(new DailyMaxItems(data));
            });
        });
    }

    getDailyMaxStatsForCountry(countrySlug: string) {
        return new Observable(observer => {
            this.httpRequestService.get(`daily_stat/country/${countrySlug}/dailystats`).subscribe(data => {
                observer.next(new DailyMaxItems(data));
            });
        });
    }

    getCountryProgression(countrySlug: string) {
        return new Observable(observer => {
            this.httpRequestService.get(`getProgression/${countrySlug}`).subscribe(data => {
                observer.next(new DailyMaxItems(data));
            });
        });
    }

    getProvinceProgression(countrySlug: string, provinceSlug: string) {
        return new Observable(observer => {
            this.httpRequestService.get(`getProgression/${countrySlug}/${provinceSlug}`).subscribe(data => {
                observer.next(new DailyMaxItems(data));
            });
        });
    }

    getCityProgression(countrySlug: string, provinceSlug: string, citySlug: string) {
        return new Observable(observer => {
            this.httpRequestService.get(`getProgression/${countrySlug}/${provinceSlug}/${citySlug}`).subscribe(data => {
                observer.next(new DailyMaxItems(data));
            });
        });
    }
  }
