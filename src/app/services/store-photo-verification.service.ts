import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseService } from './base.service';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable()
export class StorePhotoVerificationService extends BaseService {
    namespace = 'store_photo_verification';

    private _rejectReasonData = new BehaviorSubject<Array<any>>([]);
    public rejectReasonData = this._rejectReasonData.asObservable();

    getCalculationResult(): Observable<any> {

        const url = this.getUrl(this.namespace, 'calculation_result');
        return this.getApi(url);

    }
    getListStoreVerification(queryParams?): Observable<any> {

        const url = this.getUrl(this.namespace, 'list_store_verification');
        return this.getApi(url, queryParams);

    }
    postVerifyStoreVerification(body?): Observable<any> {
        const url = this.getUrl(this.namespace, 'post_verify_store_verification');
        return this.postApi(url, body);
    }

    getListRejectReason(): Observable<any> {
        const url = this.getUrl(this.namespace, 'list_reject_reason');
        return this.getApi(url);
    }
    postRejectReason(body?): Observable<any> {
        const url = this.getUrl(this.namespace, 'post_reject_reason');
        return this.postApi(url, body);
    }
    deleteRejectReason(context): Observable<any> {
        const url = this.getUrl(this.namespace, 'delete_reject_reason', context);
        return this.deleteApi(url);
    }
    deleteStorePhotoType(context: { id: number }): Observable<any> {
        const url = this.getUrl(this.namespace, 'delete_store_photo_type', context);
        return this.deleteApi(url);
    }
    getListPhotoType(queryParams?): Observable<any> {
        const url = this.getUrl(this.namespace, 'list_type');
        return this.getApi(url, queryParams);
    }
    getListDetailPhotoType(queryParams?): Observable<any> {
        const url = this.getUrl(this.namespace, 'list_detail_type');
        return this.getApi(url, queryParams);
    }
    updateSortListPhotoType(body?): Observable<any> {
        const url = this.getUrl(this.namespace, 'update_sort_list_type');
        return this.postApi(url, body);
    }
    updatePhotoTypePublishStatus(body: {id: number; publish: number}): Observable<any> {
        const url = this.getUrl(this.namespace, 'update_store_photo_type_publish_status');
        return this.postApi(url, body);
    }
    getListAdmin(queryParams?): Observable<any> {
        const url = this.getUrl(this.namespace, 'list_admin');
        return this.getApi(url, queryParams);
    }

    fetchRejectReasons() {

        this.getListRejectReason().subscribe(({ data }) => {

            this.setRejectReasonData(data);

        }, err => {

            console.log({ err });

        });
    }
    setRejectReasonData(data) {
        this._rejectReasonData.next(data || []);
    }
}