import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseService } from './base.service';
import { Observable } from 'rxjs';

@Injectable()
export class StorePhotoVerificationService extends BaseService {
    namespace = 'store_photo_verification';

    getCalculationResult(): Observable<any> {

        const url = this.getUrl(this.namespace, 'calculation_result');
        return this.getApi(url);
        
    }
    getListStoreVerification(queryParams?): Observable<any> {

        const url = this.getUrl(this.namespace, 'list_store_verification');
        return this.getApi(url, queryParams);

    }
}