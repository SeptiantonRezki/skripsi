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

  getInternalMisi(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, 'get_internal_misi');
    return this.getApi(url, queryParams);
  }

  createInternalMisi(body): Observable<any> {
    const url = this.getUrl(this.namespace, 'create_internal_misi');
    return this.postApi(url, body);
  }
  createProjectMisi(body): Observable<any> {
    const url = this.getUrl(this.namespace, 'create_project_misi');
    return this.postApi(url, body);
  }

  putInternalMisi(body, context): Observable<any> {
    const url = this.getUrl(this.namespace, 'put_internal_misi', context);
    return this.putApi(url, body);
  }
  putProjectMisi(body, context): Observable<any> {
    const url = this.getUrl(this.namespace, 'put_project_misi', context);
    return this.putApi(url, body);
  }

  deleteInternalMisi(context): Observable<any> {
    const url = this.getUrl(this.namespace, 'delete_internal_misi', context);
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

  // Verification Remark
  getVerificationRemark(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, 'get_post_verification_remark');
    return this.getApi(url, queryParams);
  }
  createVerificationRemark(body): Observable<any> {
    const url = this.getUrl(this.namespace, 'get_post_verification_remark');
    return this.postApi(url, body);
  }
  putVerificationRemark(body, context): Observable<any> {
    const url = this.getUrl(this.namespace, 'put_delete_verification_remark', context);
    return this.putApi(url, body);
  }
  deleteVerificationRemark(context): Observable<any> {
    const url = this.getUrl(this.namespace, 'put_delete_verification_remark', context);
    return this.deleteApi(url);
  }

  // Copywriting
  getCopywriting(queryParams?): Observable<any> {
    const url = this.getUrl(this.namespace, 'get_post_copywriting');
    return this.getApi(url, queryParams);
  }
  createCopywriting(body): Observable<any> {
    const url = this.getUrl(this.namespace, 'get_post_copywriting');
    return this.postApi(url, body);
  }
  putCopywriting(body, context): Observable<any> {
    const url = this.getUrl(this.namespace, 'put_delete_copywriting', context);
    return this.putApi(url, body);
  }
  deleteCopywriting(context): Observable<any> {
    const url = this.getUrl(this.namespace, 'put_delete_copywriting', context);
    return this.deleteApi(url);
  }

}
