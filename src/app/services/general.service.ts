import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GeneralService extends BaseService{
  public namespace = "general";
  
  constructor(http: HttpClient) { 
    super(http);
  }

  getSupport(): Observable<any> {
    const url = this.generateUrl(this.namespace, "support");
    return this.getApi(url);
  }

  getArea(): Observable<any> {
    const url = this.generateUrl(this.namespace, "area");
    return this.getApi(url);
  }

  getTradeProgram(): Observable<any> {
    const url = this.generateUrl(this.namespace, "trade_program");
    return this.getApi(url);
  }

  getScheduler(): Observable<any> {
    const url = this.generateUrl(this.namespace, "scheduler");
    return this.getApi(url);
  }

  getTask(): Observable<any> {
    const url = this.generateUrl(this.namespace, "task");
    return this.getApi(url);
  }

  getWholesaler(): Observable<any> {
    const url = this.generateUrl(this.namespace, "wholesaler");
    return this.getApi(url);
  }
  
  getCategory(): Observable<any> {
    const url = this.generateUrl(this.namespace, "category_product");
    return this.getApi(url);
  }

  updateUnlock(context, body): Observable<any> {
    const url = this.generateUrl(this.namespace, "unlocked", context);
    return this.postApi(url, body);
  }

  getPermissions(): Observable<any> {
    const url = this.generateUrl(this.namespace, "permissions");
    return this.getApi(url);
  }
}
