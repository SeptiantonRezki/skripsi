import { Injectable } from '@angular/core';
import { BaseService } from '../base.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PojokUntungPartnersRegisteredService extends BaseService {
  namespace = "pojok_untung_partners_registered"
  constructor(http: HttpClient) {
    super(http);
  }

  get(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, 'get');
    return this.getApi(url, queryParams);
  }
  
  getPartnerType(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, 'get_partner_type_list');
    return this.getApi(url, queryParams);
  }

  getStatus(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, 'get_status');
    return this.getApi(url, queryParams);
  }
}
