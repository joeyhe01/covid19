import { AfterViewInit, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { DailyMaxItems } from 'src/app/demo/entity/daily_max.entity';
import { environment } from '../../../../environments/environment';
import { GeoItems, GEOVALUETYPE } from './geo.entity';
import { MapService } from './map.service';

declare var L: any;
declare var $: any;

@Component({
    selector: 'app-map',
    template: `<div class='mapWrapper'>
        <div id='covidMap' *ngIf="loaded"></div>
        <span class="home" (click)="goHome()" *ngIf="selectedCountryName">
            <i class="material-icons">home</i>
        </span>
        <span class="legends" *ngIf="colors">
            <app-legend [legends]="colors"></app-legend>
        </span>
        </div>
        `,
    styleUrls: ['./map.component.scss'],
})
export class MapComponent implements AfterViewInit, OnChanges {

    constructor(private mapService: MapService) {
        this.style = this.style.bind(this);
        this.onEachFeature = this.onEachFeature.bind(this);
        this.resetHighlight = this.resetHighlight.bind(this);
        this.zoomToFeature = this.zoomToFeature.bind(this);
    }

    @Input() public dailyMaxItems: DailyMaxItems; // this is for whole country data

    @Input() public centerLat = 40.8;
    @Input() public centerLon = -20;
    @Input() public minZoom = 1; // 0-24
    @Input() public maxZoom = 10; // 0-24

    @Output() public onCountryClick: EventEmitter<any> = new EventEmitter();
    @Output() public onGoHome: EventEmitter<any> = new EventEmitter();
    public map;
    public markerIcons;
    public maxIconSize;
    public minIconSize;
    public geojson;

    public mapData;

    public selectedCountryName: string;
    public loaded = true;
    public colorList = ['#430D1B', '#900C3F', '#C70039', '#FF5733', '#ef6548', '#006400', '#013220'];
    public colors: any;
    public ngOnChanges(changes: SimpleChanges) {
        if (
            'dailyMaxItems' in changes &&
            !changes.dailyMaxItems.firstChange &&
            changes.dailyMaxItems.currentValue !==
            changes.dailyMaxItems.previousValue
        ) {
            this.dailyMaxItems = changes.dailyMaxItems.currentValue;
            if (this.selectedCountryName) {
                this.updateProvinceDataFor();
            } else {
                // this is home page
                this._updateCountryData();
            }
        }
    }

    public updateProvinceDataFor() {
        this.mapService.generateDataForProvinceFor(this.dailyMaxItems, this.selectedCountryName).subscribe((mapData) => {
            this.mapData = mapData;
            this._drawMap();
        });
    }

    public ngAfterViewInit() {
        this._updateCountryData();
    }

    public _updateCountryData() {
        this.mapService.generateDataForAllCountries(this.dailyMaxItems).subscribe((mapData) => {
            this.mapData = mapData;
            this._drawMap();
        });
    }

    public _drawMap() {
        let zoomLevel = 3;
        let newCenter = [this.centerLat, this.centerLon];
        if (this.selectedCountryName) {
            zoomLevel = 4;
            const ctr = this.mapService.getCenterPosForCountry(this.selectedCountryName);
            if (ctr !== null) {
                newCenter = ctr;
            }
        }

        this.loaded = false;
        this.colors = this.mapService.getColorLegends(JSON.parse(JSON.stringify(this.colorList)).reverse(), this.mapData.geoItems.getMaxDataFor( GEOVALUETYPE.CONFIRMED ));

        setTimeout(() => {
            this.loaded = true;
            setTimeout(() => {
                this.map = L.map('covidMap', {
                    minZoom: this.minZoom,
                    maxZoom: this.maxZoom,
                }).setView(newCenter, zoomLevel);
                L.tileLayer(`https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=${environment.mapBoxToken}`,
                    {
                        maxZoom: this.maxZoom,
                        id: 'mapbox.light',
                    }).addTo(this.map);
                this.geojson = L.geoJSON(this.mapData.data, {
                    style: this.style,
                    onEachFeature: this.onEachFeature,
                }).addTo(this.map);
                this.addMarkers();
            });
        });
    }

    public onEachFeature(feature, layer) {
        layer.on({
            mouseover: this.highlightFeature,
            mouseout: this.resetHighlight,
            click: this.zoomToFeature,
        });
    }

    public highlightFeature(e) {
        const layer = e.target;
        layer.setStyle({
            weight: 2,
            color: '#666',
            dashArray: '',
            fillOpacity: 0.7,
        });

        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            layer.bringToFront();
        }
    }

    public resetHighlight(e) {
        this.geojson.resetStyle(e.target);
    }

    public zoomToFeature(e) {
        // if already in country provinces view, do nothing here
        if (this.selectedCountryName) { return; }
        this.selectedCountryName = e.target.feature.properties.name;
        this.map.fitBounds(e.target.getBounds());
        this.onCountryClick.emit(e);
    }

    set countryName(ctrName: string) {
        this.selectedCountryName = ctrName;
    }

    public goHome() {
        this.selectedCountryName = '';
        this.onGoHome.emit();
    }

    public addMarkers() {
        let max = 0;
        this.mapData.icons.forEach((iconObj) => {
            if (iconObj.value > max) {
                max = iconObj.value;
            }
        });
        const _this = this;
        this.mapData.icons.forEach((iconObj) => {
            if (iconObj.value > 0) {
                if (iconObj.pos) {
                    let iconSize = iconObj.value / max * this.maxIconSize;
                    iconSize = iconSize > this.maxIconSize ? this.maxIconSize : iconSize;
                    iconSize = iconSize < this.minIconSize ? this.minIconSize : iconSize;
                    L.marker([iconObj.pos.lat, iconObj.pos.lng], {
                        icon: L.icon({
                            iconUrl: './assets/red_marker_32x32.png',
                            iconSize: [iconSize, iconSize],
                        }),
                    })
                        .addTo(this.map)
                        .bindPopup(iconObj.popupMsg)
                        .on('mouseover', function(e) {
                            this.openPopup();
                        })
                        .on('mouseout', function(e) {
                            this.closePopup();
                        })
                        // this is to make sure marker click is having same effect as map part click
                        .on('click', function(e) {
                            // if ('onClick' in _this.props) {
                            //     e.target['feature'] = iconObj['feature'];
                            //     _this.props.onClick(e);
                            // }
                        })
                        ;
                }
            }
        });
    }

    public style(feature) {
        return {
            fillColor: this.colorSchemaFunc(feature.properties.value),
            weight: 2,
            opacity: 0.7,
            color: 'white',
            dashArray: '3',
            fillOpacity: 0.7,
        };
    }

    public colorSchemaFunc(d) {

        return this.mapService.getColorValue(d, JSON.parse(JSON.stringify(this.colorList)).reverse(), this.mapData.geoItems.getMaxDataFor( GEOVALUETYPE.CONFIRMED ));

        // return d > 200000 ? this.colorList[0] :
        //     d > 100000 ? this.colorList[1] :
        //         d > 50000 ? this.colorList[2] :
        //             d > 10000 ? this.colorList[3] :
        //                 d > 5000 ? this.colorList[4] :
        //                     d > 1000 ? this.colorList[5] : this.colorList[6] ;
    }
}
