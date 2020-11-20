import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseService } from '../base.service';

@Injectable({
  providedIn: 'root'
})
export class PengaturanAttributeMisiService extends BaseService {

  public namespace = "pengaturan_attribute_misi";

  constructor(http: HttpClient) {
    super(http);
  }

  getToolbox(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, 'get_toolbox');
    return this.getApi(url, queryParams);
  }

  createToolbox(body): Observable<any> {
    const url = this.getUrl(this.namespace, 'create_toolbox');
    return this.postApi(url, body);
  }

  putToolbox(body, context): Observable<any> {
    const url = this.getUrl(this.namespace, 'put_toolbox', context);
    return this.putApi(url, body);
  }

  deleteToolbox(context): Observable<any> {
    const url = this.getUrl(this.namespace, 'delete_toolbox', context);
    return this.deleteApi(url);
  }

  getTipeMisi(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, 'get_tipe_misi');
    return this.getApi(url, queryParams);
  }
  getProject(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, 'get_project');
    return this.getApi(url, queryParams);
  }

  createTipeMisi(body): Observable<any> {
    const url = this.getUrl(this.namespace, 'create_tipe_misi');
    return this.postApi(url, body);
  }

  putTipeMisi(body, context): Observable<any> {
    const url = this.getUrl(this.namespace, 'put_tipe_misi', context);
    return this.putApi(url, body);
  }

  deleteTipeMisi(context): Observable<any> {
    const url = this.getUrl(this.namespace, 'delete_tipe_misi', context);
    return this.deleteApi(url);
  }
  deleteProjectMisi(context): Observable<any> {
    const url = this.getUrl(this.namespace, 'delete_project_misi', context);
    return this.deleteApi(url);
  }

  getKesulitanMisi(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, 'get_kesulitan_misi');
    return this.getApi(url, queryParams);
  }

  createKesulitanMisi(body): Observable<any> {
    const url = this.getUrl(this.namespace, 'create_kesulitan_misi');
    return this.postApi(url, body);
  }
  createProjectMisi(body): Observable<any> {
    const url = this.getUrl(this.namespace, 'create_project_misi');
    return this.postApi(url, body);
  }

  putKesulitanMisi(body, context): Observable<any> {
    const url = this.getUrl(this.namespace, 'put_kesulitan_misi', context);
    return this.putApi(url, body);
  }
  putProjectMisi(body, context): Observable<any> {
    const url = this.getUrl(this.namespace, 'put_project_misi', context);
    return this.putApi(url, body);
  }

  deleteKesulitanMisi(context): Observable<any> {
    const url = this.getUrl(this.namespace, 'delete_kesulitan_misi', context);
    return this.deleteApi(url);
  }

  getKategoriMisi(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, 'get_kategori_misi');
    return this.getApi(url, queryParams);
  }

  createKategoriMisi(body): Observable<any> {
    const url = this.getUrl(this.namespace, 'create_kategori_misi');
    return this.postApi(url, body);
  }

  putKategoriMisi(body, context): Observable<any> {
    const url = this.getUrl(this.namespace, 'put_kategori_misi', context);
    return this.putApi(url, body);
  }

  deleteKategoriMisi(context): Observable<any> {
    const url = this.getUrl(this.namespace, 'delete_kategori_misi', context);
    return this.deleteApi(url);
  }

}
