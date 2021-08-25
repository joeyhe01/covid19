export interface User {
   name: string;
   userName: string;
   password: string;
   id: number;
   city: string;
}
export class Test {
    public user: Omit<User, 'id'> = {
       name: 'User1',
       userName: 'user001',
       password: 'testpassword',
       city: 'sadfasdfs'
    };
    public user1: Partial<User>  = {
        city: 'Test City 2'
    };
}
export enum ENTITYTYPE {
    COUNTRY = 'Country',
    PROVINCE = 'Province',
    CITY = 'city'
}
export class DailyMaxItem {
    id: number;
    active: number;
    confirmed: number;
    deaths: number;
    recovered: number;
    countryName: string;
    countryId: number;
    countryCode: string;
    countrySlug: string;
    provinceName: string;
    provinceId: number;
    provinceSlug: string;
    cityName: string;
    cityId: number;
    cityCode: string;

    date: string;
    selected: boolean;
    dailyConfirmedGrowth: number;
    dailyDeathGrowth: number;
    dailyRecoveredGrowth: number;
    dailyActiveGrowth: number;

    lat: number;
    lon: number;

    constructor(item) {
        this.id = item.id || 0;
        this.active = item.active || 0;
        this.confirmed = item.confirmed || 0;
        this.deaths = item.deaths || 0;
        this.recovered = item.recovered || 0;
        this.countryName = item.countryName || '';
        this.countryId = item.countryId || 0;
        this.provinceName = item.provinceName || '';
        this.provinceId = item.provinceId || 0;
        this.provinceSlug = item.provinceSlug || '';
        this.cityName = item.cityName || '';
        this.cityId = item.cityId || 0;
        this.cityCode = item.cityCode || '';
        this.countryCode = item.countryCode || '';
        this.countrySlug = item.countrySlug || '';
        this.date = item.date || '';
        this.selected = false;
        this.dailyDeathGrowth = item.dailyActiveGrowth;
        this.dailyConfirmedGrowth = item.dailyConfirmedGrowth;
        this.dailyRecoveredGrowth = item.dailyRecoveredGrowth;
        this.dailyActiveGrowth = item.dailyActiveGrowth;
        this.lon = 'lon' in item ? item.lon : 0;
        this.lat = 'lat' in item ? item.lat : 0;
    }
}

export class DailyMaxItems {
    dailyMaxItems: DailyMaxItem[];
    constructor(list) {
        this.dailyMaxItems = [];
        list.forEach(item => {
            this.dailyMaxItems.push(new DailyMaxItem(item));
        });
    }
    set selectedItem(item: DailyMaxItem) {
        this.dailyMaxItems.forEach(i => {
            i.selected = false;
        });
        item.selected = true;
    }
    get selectedItem() {
        return this.dailyMaxItems.find(i => {
            return i.selected;
        });
    }
    get latestDate() {
        return this.dailyMaxItems[0].date;
    }

    get graphData() {
        const data = [];
        const confirmed: any[] = ['Confirmed'];
        const active: any[] = ['Active'];
        const deaths: any[] = ['Deaths'];
        const recovered: any[] = ['Recovered'];
        data.push(confirmed);
        data.push(active);
        data.push(deaths);
        data.push(recovered);
        for (let i = this.dailyMaxItems.length - 1; i >= 0; i--) {
            confirmed.push(this.dailyMaxItems[i].confirmed);
            active.push(this.dailyMaxItems[i].active);
            deaths.push(this.dailyMaxItems[i].deaths);
            recovered.push(this.dailyMaxItems[i].recovered);
        }
        return data;
    }

    get growthData() {
        const data = [];
        const confirmed: any[] = ['Daily Confirmed'];
        const active: any[] = ['Daily Active'];
        const deaths: any[] = ['Daily Deaths'];
        const recovered: any[] = ['Daily Recovered'];
        data.push(confirmed);
        data.push(active);
        data.push(deaths);
        data.push(recovered);
        for (let i = this.dailyMaxItems.length - 1; i >= 0; i--) {
            confirmed.push(this.dailyMaxItems[i].dailyConfirmedGrowth);
            active.push(this.dailyMaxItems[i].dailyActiveGrowth);
            deaths.push(this.dailyMaxItems[i].dailyDeathGrowth);
            recovered.push(this.dailyMaxItems[i].dailyRecoveredGrowth);
        }
        return data;
    }

    get dates() {
        const dates = [];
        for (let i = this.dailyMaxItems.length - 1; i >= 0; i--) {
            dates.push(this.dailyMaxItems[i].date);
        }
        return dates;
    }

    get allCountryNames() {
        const names = [];
        this.dailyMaxItems.forEach(item => {
            names.push(item.countryName);
        });
        return names;
    }
    findByCountryName(name) {
        return this.dailyMaxItems.filter(item => {
            return item.countryName.includes(name);
        });
    }

}
