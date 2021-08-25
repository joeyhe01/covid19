import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DailyMaxItems } from 'src/app/demo/entity/daily_max.entity';
import { HttpRequestService } from '../../http_request.service';
import { countryGeoCode, worldData } from './data';
import { GeoItems, GeoJsonMappper, GEOVALUETYPE } from './geo.entity';

declare var $: any;

// export const GeoJsonMappper = {
//     'US': 'United States of America', //US is in our data, long name is in map data
//     'Korea, South': 'South Korea',
// };

export const CountryGeoJsonNameMapper = {
    Australia: 'australia',
    Brazil: 'brazil-states',
    Canada: 'canada',
    China: 'china',
    France: 'france-regions',
    Germany: 'germany',
    Italy: 'italy-provinces',
    Japan: 'japan',
    Poland: 'poland',
    Russia: 'russia',
    Spain: 'spain-provinces',
    Taiwan: 'taiwan',
    Netherlands: 'the-netherlands',
    Turkey: 'turkey',
    'United Kingdom': 'united-kingdom',
    'United States of America': 'united-states',
};

export const getDBCountryName = function(name: string) {
    const names = Object.keys(GeoJsonMappper);
    let foundName = '';
    Object.keys(GeoJsonMappper).forEach((key) => {
        if (GeoJsonMappper[key] === name ) {
            foundName = key;
        }
    });
    if (foundName === '') {
        foundName = name;
    }
    return foundName;
};

const findCountryGeoCode = function(countryName) {
    let geoCode = null;
    countryGeoCode.forEach((item) => {
        if (item.name == countryName) {
            geoCode = item.location;
        }
    });
    return geoCode;
};

// this is only for country level, so we need to start from worldData
const processMapDataForCountry = function(dailyMaxItems: DailyMaxItems) {
    return _getMapData(dailyMaxItems, null,  'country');
};

const getMapDataForProvince = function(countryName: string, dailyMaxItems: DailyMaxItems) {
    return _getMapData(dailyMaxItems, countryName, 'province');
};

const _getMapData = function(dailyMaxItems: DailyMaxItems, name: string,  type= 'country') {

    return new Observable((observer) => {
        const geoItems: GeoItems = new GeoItems(dailyMaxItems);
        const icons = [];
        if (type === 'country') {
            // generate country geo data
            const world_data = JSON.parse(JSON.stringify(worldData));
            world_data.features.forEach((feature) => {
                feature.properties.value =  geoItems.getCountryValueFor(feature.properties.name, GEOVALUETYPE.CONFIRMED );
                feature.properties.dailyMaxItem = geoItems.getDailyMaxItemFor(feature.properties.name);
                icons.push({
                    pos: findCountryGeoCode(feature.properties.name),
                    value: feature.properties.value,
                    popupMsg: feature.properties.name + ': ' + parseFloat(feature.properties.value).toLocaleString(),
                    feature,
                });

            });
            observer.next([world_data, icons, geoItems]);
        } else if (type === 'province') {
            if (name === 'US') {
                name = 'United States of America';
            }
            const url = 'assets/geo_json/' + CountryGeoJsonNameMapper[name] + '.geojson';
            requestService.getStaticData(url).subscribe((state_data) => {
                // we need to process data here!
                state_data.features.forEach((feature) => {
                    feature.properties.value = geoItems.getProvinceValueFor(feature.properties.name, GEOVALUETYPE.CONFIRMED);
                    if (geoItems.getProvinceGeoLocationFor(feature.properties.name)) {
                        icons.push({
                            pos: {
                                lat: geoItems.getProvinceGeoLocationFor(feature.properties.name)[0],
                                lng: geoItems.getProvinceGeoLocationFor(feature.properties.name)[1],
                            },
                            value: feature.properties.value,
                            popupMsg: feature.properties.name + ': ' + (feature.properties.value).toLocaleString(),
                            feature,
                        });
                    }
                });
                observer.next([state_data, icons, geoItems]);
            });
        }
    });
};

let requestService;

@Injectable()
export class MapService {

    constructor(private httpRequestService: HttpRequestService) {
        requestService = httpRequestService;
    }

    public numbersPerBlock: number[] = [
        5000000,
        2000000,
        1000000,
        500000,
        100000,
        50000,
        0,
    ];

    public generateDataForAllCountries(dailyMaxItems: DailyMaxItems) {
        return new Observable((observer) => {
            processMapDataForCountry(dailyMaxItems).subscribe((mapData) => {
                observer.next({
                    data: mapData[0],
                    geoItems: mapData[2],
                    icons: mapData[1],
                });
            });
        });
    }

    public generateDataForProvinceFor(dailyMaxItems: DailyMaxItems, countryName: string) {
        return new Observable((observer) => {
            getMapDataForProvince(countryName, dailyMaxItems).subscribe((mapData) => {
                observer.next({
                    data: mapData[0],
                    geoItems: mapData[2],
                    icons: mapData[1],
                });
            });
        });
    }

    public getColorLegends(colorList, maxUsers) {
        // const numPerBlock = Math.floor(maxUsers / colorList.length / 10) * 10;
        const tmpResults = {};
        // for (let i = colorList.length - 1; i >= 0; i--) {
        //     tmpResults['> ' + ((numPerBlock * i).toLocaleString()) + ' users'] = colorList[i];
        // }
        const colors = JSON.parse(JSON.stringify(colorList)).reverse();
        for (let i = 0; i < this.numbersPerBlock.length ; i++) {
            tmpResults['> ' + ((this.numbersPerBlock[i]).toLocaleString()) + ' users'] = colors[i];
        }
        return tmpResults;
    }

    public getColorValue(count, colorList, maxUsers): string {
        // const numPerBlock = Math.floor(maxUsers / colorList.length / 10) * 10;
        let foundColor = '';
        const colors = JSON.parse(JSON.stringify(colorList)).reverse();
        for (let i = 0; i < this.numbersPerBlock.length ; i++) {
            if (count >  this.numbersPerBlock[i]) {
                foundColor = colors[i];
                break;
            }
        }
        return foundColor;
    }

    public getCenterPosForCountry(countryName: string) {
        let center = null;
        countryGeoCode.forEach((feature) => {
            if (feature.name === countryName) {
                center = [feature.location.lat, feature.location.lng];
            }
        });
        return center;
    }
}
