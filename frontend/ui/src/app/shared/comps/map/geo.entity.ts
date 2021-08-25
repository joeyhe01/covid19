import { DailyMaxItem, DailyMaxItems } from 'src/app/demo/entity/daily_max.entity';

export const GeoJsonMappper = {
    'US': 'United States of America', //US is in our data, long name is in map data
    'Korea, South': 'South Korea',
};

export enum GEOVALUETYPE {
    CONFIRMED = 'confirmed',
    RECOVERED = 'recovered',
    DEATHS = 'deaths',
    ACTIVE = 'active'
}

export class GeoItems {

    geoItems: GeoItem[];

    totalConfirmed: number;
    totalDeaths: number;
    totalRecovered: number;
    totalActive: number;

    maxConfirmedPerFeature: number;
    maxDeathsPerFeature: number;
    maxRecoveredPerFeature: number;
    maxActiverPerFeature: number;
    stateDataForCountry: any;

    constructor(dailyMaxItems: DailyMaxItems) {
        this.geoItems = [];

        this.totalConfirmed = this.totalDeaths = this.totalRecovered = this.totalActive = 0;
        this.maxConfirmedPerFeature = this.maxDeathsPerFeature = this.maxRecoveredPerFeature = this.maxActiverPerFeature = 0;

        this.stateDataForCountry = {};


        dailyMaxItems.dailyMaxItems.forEach(dailyMaxItem => {

            this.geoItems.push(new GeoItem(dailyMaxItem));
            this.totalConfirmed += dailyMaxItem.confirmed;
            this.totalDeaths += dailyMaxItem.deaths;
            this.totalRecovered += dailyMaxItem.recovered;
            this.totalActive += dailyMaxItem.active;

            this.maxConfirmedPerFeature =
                dailyMaxItem.confirmed > this.maxConfirmedPerFeature ?
                    dailyMaxItem.confirmed : this.maxConfirmedPerFeature;
            this.maxDeathsPerFeature =
                dailyMaxItem.deaths > this.maxDeathsPerFeature ?
                    dailyMaxItem.deaths : this.maxDeathsPerFeature;
            this.maxRecoveredPerFeature =
                dailyMaxItem.recovered > this.maxRecoveredPerFeature ?
                    dailyMaxItem.recovered : this.maxRecoveredPerFeature;
            this.maxActiverPerFeature =
                dailyMaxItem.active > this.maxActiverPerFeature ?
                    dailyMaxItem.active : this.maxActiverPerFeature;
        });
    }

    getGeoItemByCountry(countryName) {
        let foundItem = null;
        for (let i = 0; i < this.geoItems.length; i++) {
            if (this.geoItems[i].countryName === countryName) {
                foundItem = this.geoItems[i];
                break;
            }
        }
        return foundItem;
    }

    getGeoItemByProvince(provinceName) {
        let foundItem = null;
        for (let i = 0; i < this.geoItems.length; i++) {
            if (this.geoItems[i].provinceName === provinceName) {
                foundItem = this.geoItems[i];
                break;
            }
        }
        return foundItem;
    }

    getCountryValueFor(name, type) {
        const item = this.getGeoItemByCountry(name);
        if (item) {
            return item.dailyMaxItem[type];
        } else {
            return null;
        }
    }

    getProvinceValueFor(name, type) {
        const item = this.getGeoItemByProvince(name);
        if (item) {
            return item.dailyMaxItem[type];
        } else {
            return null;
        }
    }

    getProvinceGeoLocationFor(name) {
        const item = this.getGeoItemByProvince(name);
        if (item) {
            return [item.lat, item.lon];
        } else {
            return null;
        }
    }

    getDailyMaxItemFor(name) {
        const item = this.getGeoItemByCountry(name);
        if (item) {
            return item.dailyMaxItem;
        } else {
            return null;
        }
    }

    getMaxDataFor(type: string) {
        const updatedName = type.substr(0, 1).toUpperCase() + type.substr(1).toLowerCase();
        const typeName = `max${updatedName}PerFeature`;
        return this[typeName];
    }

    get items() {
        return this.geoItems;
    }
}

export class GeoItem {
    countryName: string;
    provinceName: string;
    cityName: string;

    lat: number;
    lon: number;
    dailyMaxItem: DailyMaxItem;

    constructor(dailyMaxItem: DailyMaxItem) {

        this.countryName = dailyMaxItem.countryName in GeoJsonMappper ? GeoJsonMappper[dailyMaxItem.countryName] : dailyMaxItem.countryName;
        this.provinceName = dailyMaxItem.provinceName;
        this.cityName = dailyMaxItem.cityName;
        this.lat = dailyMaxItem.lat;
        this.lon = dailyMaxItem.lon;

        this.dailyMaxItem = dailyMaxItem;
    }
}
