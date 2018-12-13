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
}
