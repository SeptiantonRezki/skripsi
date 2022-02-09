import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseService } from '../base.service';

@Injectable({
  providedIn: 'root'
})
export class MasterKPIService extends BaseService {

  public namespace = 'masterKPI';

  constructor(http: HttpClient) {
    super(http);
  }

  getBrands(): Observable<any> {
    const url = this.getUrl(this.namespace, 'brands');
    return this.getApi(url);
  }
  getBrandParameters(): Observable<any> {
    const url = this.getUrl(this.namespace, 'brand_parameters');
    return this.getApi(url);
  }
  getTradeProgramObjectives(context): Observable<any> {
    const url = this.getUrl(this.namespace, 'trade_program_objectives', context);
    return this.getApi(url);
  }
  getEcosystemParams(queryParams?: any): Observable<any> {
    const url = this.getUrl(this.namespace, 'ecosystem_params');
    return this.getApi(url, queryParams);
  }
  getEcosystemBrands(queryParams?: any): Observable<any> {
    const url = this.getUrl(this.namespace, 'ecosystem_brands');
    return this.getApi(url, queryParams);
  }
}
