import { Injectable } from '@angular/core';
import { BaseService } from '../base.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class OrderCatalogueService extends BaseService {
    namespace = "orders_catalogue"

    constructor(http: HttpClient) {
        super(http);
    }

    get(queryParams?): Observable<any> {
        const url = this.getUrl(this.namespace, 'get');
        return this.getApi(url, queryParams);
    }

    show(context?): Observable<any> {
        const url = this.getUrl(this.namespace, 'update', context);
        return this.getApi(url, {});
    }

    // create(body): Observable<any> {
    //     const url = this.getUrl(this.namespace, 'create');
    //     return this.postApi(url, body);
    // }

    update(context?, body?): Observable<any> {
        const url = this.getUrl(this.namespace, 'update', context);
        return this.putApi(url, body);
    }

    updateStatus(context?, body?): Observable<any> {
        const url = this.getUrl(this.namespace, 'update_status', context);
        return this.putApi(url, body);
    }

    export(): Observable<any> {
        const url = this.getUrl(this.namespace, "export");
        return this.getBlobAsJsonApi(url)
    }

    // delete(context): Observable<any> {
    //     const url = this.getUrl(this.namespace, 'delete', context);
    //     return this.deleteApi(url);
    // }
}
