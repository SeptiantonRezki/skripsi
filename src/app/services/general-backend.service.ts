import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { HttpBackend, HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BackendBaseService } from './backendbase.service';
import { Endpoint } from 'app/classes/endpoint';

@Injectable({
  providedIn: 'root'
})
export class GeneralBackendService extends BackendBaseService {
  public namespace = "general";

  constructor(handler: HttpBackend) {
    super(handler);
    this.endpoint = new Endpoint();
  }

  getCountry(): Observable<any> {
    const url = this.generateUrl(this.namespace, "country");
    return this.getApi(url);
  }
}
