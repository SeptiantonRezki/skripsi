import { Injectable } from '@angular/core';
import { BaseService } from '../base.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ProductCatalogueService extends BaseService {
    namespace = "product_catalogue"

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

    create(body): Observable<any> {
        const url = this.getUrl(this.namespace, 'create');
        return this.postApi(url, body);
    }

    update(context?, body?): Observable<any> {
        const url = this.getUrl(this.namespace, 'update', context);
        return this.putApi(url, body);
    }

    delete(context): Observable<any> {
        const url = this.getUrl(this.namespace, 'delete', context);
        return this.deleteApi(url);
    }

    deleteAll(): Observable<any> {
        const url = this.getUrl(this.namespace, "delete_all");
        return this.getApi(url);
    }

    getCategories(queryParams?): Observable<any> {
        const url = this.getUrl(this.namespace, "categories");
        return this.getApi(url, queryParams);
    }

    export(queryParams?): Observable<any> {
        const url = this.getUrl(this.namespace, "export");
        return this.getApi(url, queryParams);
    }
}
