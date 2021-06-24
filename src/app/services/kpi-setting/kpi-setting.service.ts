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
  getById(context): Observable<any> {
    const url = this.getUrl(this.namespace, 'get_by_id', context);
    return this.getApi(url);
  }
  // put(body, context): Observable<any> {
  //   console.log('nyampe service', context);
  //   const url = this.getUrl(this.namespace, 'put', context);
  //   return this.putApi(url, body);
  // }
}
