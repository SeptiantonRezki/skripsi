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
  getTradeProgramObjectives(): Observable<any> {
    const url = this.getUrl(this.namespace, 'trade_program_objectives');
    return this.getApi(url);
  }
}
