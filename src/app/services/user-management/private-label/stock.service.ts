import { Injectable } from '@angular/core';
import { BaseService } from '../../base.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class PLStockService extends BaseService {
  public namespace = 'PLStock';

  constructor(http: HttpClient) {
    super(http);
  }

  getList(queryParams?: any): Observable<any> {
    const url = this.getUrl(this.namespace, 'getList');
    return this.getApi(url, queryParams);
  }

  update(body?: any, context?: any): Observable<any> {
    const url = this.getUrl(this.namespace, 'update', context);
    return this.postApi(url, body);
  }

  check(body?): Observable<any> {
    const url = this.getUrl(this.namespace, "check");
    return this.getApi(url, body);
  }

  getDataTable(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, "get_table");
    return this.getApi(url, queryParams);
  }

  updateGeotree(body?): Observable<any> {
    const url = this.getUrl(this.namespace, "update_geotree");
    return this.postApi(url, body);
  }
}
