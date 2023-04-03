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
    const url = this.getUrl("pojok_untung_partners_type", 'get_partner_type');
    return this.getApi(url, queryParams);
  }

  getStatus(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, 'get_status');
    return this.getApi(url, queryParams);
  }

  exportPartner(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, 'export');
    return this.getBlobAsJsonApi(url, queryParams);
  }

  importFile(body): Observable<any> {
    const url = this.getUrl(this.namespace, 'import');
    return this.postApi(url, body);
  }

  previewImport(body?): Observable<any> {
    const url = this.getUrl(this.namespace, "preview");
    return this.postApi(url, body);
  }
}
