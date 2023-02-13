import { Injectable } from '@angular/core';
import { BaseService } from '../base.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PojokUntungPartnersListService extends BaseService {
  namespace = "pojok_untung_partners_list"
  constructor(http: HttpClient) {
    super(http);
  }

  get(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, 'get');
    return this.getApi(url, queryParams);
  }

  show(context, queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, 'show', context);
    return this.getApi(url, queryParams);
  }

  store(body): Observable<any> {
    const url = this.getUrl(this.namespace, 'store');
    return this.postApi(url, body);
  }

  delete(context): Observable<any> {
    const url = this.getUrl(this.namespace, 'delete', context);
    return this.deleteApi(url);
  }

  getPartnerType(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, 'get_partner_type_list');
    return this.getApi(url, queryParams);
  }

}
