import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
@Injectable()
export class HttpRequestService {

    constructor(private http: HttpClient) {}

    public getStaticData(url: string) {
        console.log( environment.hostUrl + '/' + url );
            return this.http.get(environment.hostUrl + '/' + url);
    }

    public get(url: string) {
        return this.http.get(environment.apiUrl + '/' + url);
    }

}
