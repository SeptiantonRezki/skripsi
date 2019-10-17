import { Injectable } from '@angular/core';
import { BaseService } from '../base.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class SupportService extends BaseService {
  public namespace = "support";
  constructor(http: HttpClient) {
    super(http);
  }

  get(context?): Observable<any> {
    const url = this.getUrl(this.namespace, "get", context);
    return this.getApi(url);
  }

  getBantuanListCategory(context?: any): Observable<any> {
    const url = this.getUrl(this.namespace, "getBantuanListCategory",context);
    return this.getApi(url);
  }

  getBantuanListCategoryDetails(context?: any): Observable<any> {
    const url = this.getUrl(this.namespace, "getBantuanListCategoryDetails", context);
    return this.getApi(url);
  }
  
  getBantuanShowDetail(context?: any): Observable<any> {
    const url = this.getUrl(this.namespace, "getBantuanShowDetail", context);
    return this.getApi(url);
  }

  like(context?: any): Observable<any> {
    const url = this.getUrl(this.namespace, "like", context);
    return this.getApi(url);
  }

  unlike(context?: any): Observable<any> {
    const url = this.getUrl(this.namespace, "unlike", context);
    return this.getApi(url);
  }

  search(context?: any): Observable<any> {
    const url = this.getUrl(this.namespace, "search", context);
    return this.getApi(url);
  }


}
