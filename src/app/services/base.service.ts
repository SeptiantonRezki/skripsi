import { Injectable } from '@angular/core';
import { Endpoint } from '../classes/endpoint';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse, HttpRequest } from "@angular/common/http";
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/map';
import * as _ from 'underscore';
import { ResponseContentType, RequestOptions } from '@angular/http';
@Injectable()
export class BaseService {
  constructor(protected http: HttpClient) {
    if (!(<any>Object).entries)
      (<any>Object).entries = (obj) => {
        var ownProps = Object.keys(obj),
          i = ownProps.length,
          resArray = new Array(i); // preallocate the Array
        while (i--)
          resArray[i] = [ownProps[i], obj[ownProps[i]]];

        return resArray;
      };
  }

  clean(obj) {
    for (var propName in obj) {
      if (obj[propName] === null || obj[propName] === undefined) {
        delete obj[propName];
      }
    }
  }


  loopParams(params) {
    let query = new HttpParams();
    let parameter = (params !== null) ? params : {};
    var result = (<any>Object).entries(parameter);
    for (let i = 0; i < result.length; i++) {
      if (result[i][1]) {
        query = query.set(result[i][0].toString(), result[i][1].toString());
      }
    }
    return query;
  }

  private endpoint = new Endpoint();


  protected getUrl(namespace, key, context: any = '') {
    return this.endpoint.getUrl(namespace, key, context)
  }

  protected getApi(url, params: any = null) {
    let headers = new HttpHeaders().set('Content-Type', 'application/json').set('Accept', 'application/json');
    let query = this.loopParams(params);
    return this.http.get(url, { headers: headers, params: query });
  }

  protected getWithBasicAuthApi(url, body, creds) {
    let headers = new HttpHeaders().set('Content-Type', 'application/json').set('Accept', 'application/json').set('Authorization', btoa(`${creds.username}:${creds.password}`));
    return this.http.post(url, body, { headers: headers });
  }

  protected getBlobApi(url, params: any = null) {
    let headers = new HttpHeaders();
    let query = this.loopParams(params);
    return this.http.get(url, { responseType: 'arraybuffer', headers: headers, params: query });
  }

  protected getBlobAsJsonApi(url, params: any = null) {
    let headers = new HttpHeaders().set('Content-Type', 'application/json').set('Accept', 'application/json');
    let query = this.loopParams(params);
    return this.http.get(url, { responseType: 'blob' as 'json', headers: headers, params: query });
  }

  protected postBlobAsJsonApi(url, request, params: any = null) {
    let headers = new HttpHeaders().set('Content-Type', 'application/json').set('Accept', 'application/json');
    let query = this.loopParams(params);
    return this.http.post(url, request, { responseType: 'blob' as 'json', headers: headers, params: query });
  }

  protected postBlobApi(url, request, params: any = null) {
    let headers = new HttpHeaders();
    let query = this.loopParams(params);
    return this.http.post(url, request, { responseType: 'arraybuffer', headers: headers, params: query });
  }

  protected postApi(url, request, params: any = null, requestConfig?) {
    if (!requestConfig) {
      requestConfig = {};
    }
    let query = this.loopParams(params);
    this.clean(request);
    let headers = new HttpHeaders().set('Accept', 'application/json');
    return this.http.post(url, request, { ...requestConfig, headers, params: query });
  }

  protected postApiTest(url, request, params: any = null, requestConfig?) {
    if (!requestConfig) {
      requestConfig = {};
    }
    let query = this.loopParams(params);
    this.clean(request);
    let headers = new HttpHeaders().set('Accept', 'application/json');
    headers.set('Content-Type', 'application/json')
    return this.http.post(url, request, { responseType: 'blob', headers, params: query });
  }

  protected multipartPost(url, request) {
    return this.http.post(url, request)
  }

  protected putApi(url, request) {
    let headers = new HttpHeaders().set('Accept', 'application/json');
    return this.http.put(url, request, { headers });
  }

  protected putWithParamsApi(url, request, params) {
    let query = this.loopParams(params);
    this.clean(request);
    let headers = new HttpHeaders().set('Accept', 'application/json');
    return this.http.put(url, request, { headers, params: query });
  }

  protected deleteApi(url, request: any = null) {
    let headers = new HttpHeaders().set('Accept', 'application/json');
    return this.http.request('delete', url, { body: request, headers });
  }

  protected deleteWithParamsApi(url, request: any = null, params) {
    let query = this.loopParams(params);
    this.clean(request);
    let headers = new HttpHeaders().set('Accept', 'application/json');
    return this.http.request('delete', url, { body: request, headers, params: query });
  }

  protected extractData(res: HttpResponse<any>) {
    const body = res;
    return body || {};
  }

  protected handleError(error: any) {
    // const status = error.status;
    // const errMsg = {
    //   error: error.error,
    //   status: status
    // };
    // return Observable.throw(errMsg || 'Server error');
  }

  public generateUrl(namespace, key, context: any = '') {
    return this.endpoint.getUrl(namespace, key, context)
  }

}
