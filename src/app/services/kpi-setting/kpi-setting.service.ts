import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseService } from '../base.service';

@Injectable({
  providedIn: 'root'
})
export class KPISettingService extends BaseService {

  public namespace = 'kpiSetting';

  constructor(http: HttpClient) {
    super(http);
  }

  getList(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, 'get');
    return this.getApi(url, queryParams);
  }
  getKPS(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, 'get_kps');
    return this.getApi(url, queryParams);
  }
  getById(context): Observable<any> {
    const url = this.getUrl(this.namespace, 'get_by_id', context);
    return this.getApi(url);
  }

  create(body): Observable<any> {
    const url = this.getUrl(this.namespace, 'post');
    return this.postApi(url, body);
  }

  update(body): Observable<any> {
    const url = this.getUrl(this.namespace, 'put');
    return this.putApi(url, body);
  }

  delete(context): Observable<any> {
    const url = this.getUrl(this.namespace, 'delete', context);
    return this.deleteApi(url);
  }
}
