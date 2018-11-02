import { Injectable } from '@angular/core';
import { BaseService } from '../base.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class CoinService extends BaseService {
  public namespace = "coin";
  constructor(http: HttpClient) { 
    super(http)
  }

  getRetailer(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, "retailer");
    return this.getApi(url, queryParams);
  }

  getProgram(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, "program");
    return this.getApi(url, queryParams);
  }

  getListLevel(): Observable<any> {
    const url = this.getUrl(this.namespace, "list_level");
    return this.getApi(url);
  }

  getListChildren(context): Observable<any> {
    const url = this.getUrl(this.namespace, "list_children", context);
    return this.getApi(url);
  }

  getListOtherChildren(context): Observable<any> {
    const url = this.getUrl(this.namespace, "list_other_children", context);
    return this.getApi(url);
  }

  flush(body?): Observable<any> {
    const url = this.getUrl(this.namespace, "flush");
    return this.postApi(url, body);
  }

  detailProgram(context?, queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, "detail_program", context);
    return this.getApi(url, queryParams);
  }

  detailRetailer(context?, queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, "detail_retailer", context);
    return this.getApi(url, queryParams);
  }

  getParentArea(context?): Observable<any> {
    const url = this.getUrl(this.namespace, "parent", context);
    return this.getApi(url);
  }
}
