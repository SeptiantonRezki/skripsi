import { Injectable } from '@angular/core';
import { BaseService } from '../base.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PojokUntungPartnersRegisteredService extends BaseService {
  namespace = "pojok_untung_partners_registered"
  constructor(http: HttpClient) {
    super(http);
  }
}
