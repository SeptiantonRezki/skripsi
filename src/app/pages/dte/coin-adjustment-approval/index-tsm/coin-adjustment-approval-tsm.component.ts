import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DateAdapter, MatDialog } from '@angular/material';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { Page } from 'app/classes/laravel-pagination';
import { PagesName } from 'app/classes/pages-name';
import { DataService } from 'app/services/data.service';
import { DialogService } from 'app/services/dialog.service';
import { CoinAdjustmentApprovalService } from 'app/services/dte/coin-adjustment-approval.service';
import { IdleService } from 'app/services/idle.service';
import { Observable, Subject } from 'rxjs';
import * as moment from "moment";

@Component({
  selector: 'app-coin-adjustment-approval-tsm',
  templateUrl: './coin-adjustment-approval-tsm.component.html',
  styleUrls: ['./coin-adjustment-approval-tsm.component.scss']
})
export class CoinAdjustmentApprovalTSMComponent implements OnInit {
  onLoad: boolean;
  loadingIndicator: boolean;

  permissionCoinAdjustment: any;
  roles: PagesName = new PagesName();

  rows: any[];
  keyUp = new Subject<string>();

  table: DatatableComponent;
  reorderable = true;
  pagination: Page = new Page();
  offsetPagination: any;

  formFilter: FormGroup;

  minDate: any;

  statusFilter: any[] = [
    { name: 'Urutkan Perhari', value: 'day' },
    { name: 'Urutkan Perbulan', value: 'mounth' },
    { name: 'Urutkan Pertahun', value: 'year' }
  ];

  listStatuses: any[] = [
    { name: 'Semua Status', value: "" },
    { name: 'Publish', value: 'publish' },
    { name: 'Unpublish', value: 'unpublish' },
    { name: 'Draft', value: 'draft' }
  ];

  dialogRef: any;
  @ViewChild('downloadLink') downloadLink: ElementRef;

  constructor(
    private dialogService: DialogService,
    private adapter: DateAdapter<any>,
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private userIdle: IdleService,
    private dialog: MatDialog,
    private coinAdjustmentApprovalService: CoinAdjustmentApprovalService
  ) {
    this.adapter.setLocale('id');
    this.rows = [];
    this.onLoad = true;
    this.loadingIndicator = true;

    this.permissionCoinAdjustment = this.roles.getRoles('principal.dtecoinadjustmentapproval');

    this.keyUp.debounceTime(500)
      .flatMap(search => {
        return Observable.of(search).delay(500);
      })
      .subscribe(res => {
        this.updateFilter(res);
      });
  }

  ngOnInit() {
    this.getListCoinAdjustmentTSM();

    this.formFilter = this.formBuilder.group({
      filter: 'day',
      start_date: '',
      end_date: '',
      status: '',
    });
  }

  updateFilter(string?) {
    this.loadingIndicator = true;
    this.pagination.search = string;

    if (string) {
      this.pagination.page = 1;
      this.offsetPagination = 0;
    } else {
      const page = this.dataService.getFromStorage('page');
      this.pagination.page = page;
      this.offsetPagination = page ? (page - 1) : 0;
    }

    this.pagination['type'] = this.convertDate(this.formFilter.get('start_date').value) ||
      this.convertDate(this.formFilter.get('end_date').value) ? this.formFilter.get('filter').value : '';
    this.pagination.start_date = this.convertDate(this.formFilter.get('start_date').value);
    this.pagination.end_date = this.convertDate(this.formFilter.get('end_date').value);
    this.pagination['status'] = this.formFilter.get('status').value;

    this.coinAdjustmentApprovalService.getTsm(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data;
      this.loadingIndicator = false;
    });
  }

  getListCoinAdjustmentTSM() {
    const page = this.dataService.getFromStorage('page');
    const sort_type = this.dataService.getFromStorage('sort_type');
    const sort = this.dataService.getFromStorage('sort');

    this.pagination.page = page;
    this.pagination.sort_type = sort_type;
    this.pagination.sort = sort;

    this.offsetPagination = page ? (page - 1) : 0;

    this.coinAdjustmentApprovalService.getTsm(this.pagination).subscribe(
      res => {
        if (res.total < res.per_page && page !== 1) {
          this.dataService.setToStorage('page', 1);
          this.getListCoinAdjustmentTSM();
        } else {
          Page.renderPagination(this.pagination, res);
          this.rows = res.data;
          this.onLoad = false;
          this.loadingIndicator = false;
        }
      }, err => {
        console.error(err);
        this.onLoad = false;
        this.loadingIndicator = false;
      }
    );
  }

  convertDate(param?: Date) {
    if (param) {
      return moment(param).format('YYYY-MM-DD');
    }

    return '';
  }

  setMinDate(e) { }

  export(item) {
    this.dataService.showLoading({ show: true });
    let params = {
      approval_id: item.id,
      is_tsm: true
    }

    console.log("Ke Click gak sih ini cuk ett dah", params);
    this.coinAdjustmentApprovalService.downloadApprovalList(params).subscribe(response => {
      console.log('resss', response);
      if (response.data && response.status) {
        setTimeout(() => {
          this.downloadLink.nativeElement.href = response.data;
          this.downloadLink.nativeElement.click();
          this.dataService.showLoading(false);
        }, 500);
      }
    }, err => {
      this.dataService.showLoading(false);
    })
  }

  setPage(pageInfo) {
    this.offsetPagination = pageInfo.offset;
    this.loadingIndicator = true;

    if (this.pagination['search']) {
      this.pagination.page = pageInfo.offset + 1;
    } else {
      this.dataService.setToStorage("page", pageInfo.offset + 1);
      this.pagination.page = this.dataService.getFromStorage("page");
    }

    this.coinAdjustmentApprovalService.getTsm(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data;
      this.loadingIndicator = false;
    });
  }

  onSort(event) {
    this.pagination.sort = event.column.prop;
    this.pagination.sort_type = event.newValue;
    this.pagination.page = 1;
    this.pagination['type'] = this.formFilter.get('filter').value;
    this.pagination.start_date = this.convertDate(this.formFilter.get('start_date').value);
    this.pagination.end_date = this.convertDate(this.formFilter.get('end_date').value);
    this.loadingIndicator = true;

    this.dataService.setToStorage("page", this.pagination.page);
    this.dataService.setToStorage("sort", event.column.prop);
    this.dataService.setToStorage("sort_type", event.newValue);

    this.coinAdjustmentApprovalService.getTsm(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data;
      this.loadingIndicator = false;
    });
  }
}
