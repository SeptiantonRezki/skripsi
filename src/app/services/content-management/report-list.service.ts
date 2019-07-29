import { Injectable } from '@angular/core';
import { BaseService } from '../base.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ReportListService extends BaseService {
  public namespace = "report_list";
  constructor(http: HttpClient) {
    super(http)
  }
}
