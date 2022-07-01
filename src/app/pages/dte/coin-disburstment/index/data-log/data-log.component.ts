import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DateAdapter, MatDialog, MatDialogConfig } from '@angular/material';
import { Router } from '@angular/router';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { Page } from 'app/classes/laravel-pagination';
import { PagesName } from 'app/classes/pages-name';
import { DataService } from 'app/services/data.service';
import { DialogService } from 'app/services/dialog.service';
import { CoinDisburstmentService } from 'app/services/dte/coin-disburstment.service';
import { LanguagesService } from 'app/services/languages/languages.service';
import moment from 'moment';
import * as CryptoJS from 'crypto-js';
import { Observable, Subject } from 'rxjs';
import { ImportExchangeCoinComponent } from '../import-exchange-coin/import-exchange-coin.component';

@Component({
  selector: 'app-data-log',
  templateUrl: './data-log.component.html',
})
export class DataLogComponent implements OnInit {
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
  id: any;
  dialogRef: any;
  @ViewChild('downloadDataLog') downloadDataLog: ElementRef;

  constructor(
    private dialogService: DialogService,
    private adapter: DateAdapter<any>,
    private dataService: DataService,
    private coinDisburstmentService: CoinDisburstmentService,
    private router: Router,
    private ls: LanguagesService,
    private dialog: MatDialog,
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
    this.getCoinDisburstment()
  }

  getCoinDisburstment() {
    const page = this.dataService.getFromStorage('page');
    const sort_type = this.dataService.getFromStorage('sort_type');
    const sort = this.dataService.getFromStorage('sort');

    this.pagination.page = page;
    this.pagination.sort_type = sort_type;
    this.pagination.sort = sort;

    this.offsetPagination = page ? (page - 1) : 0;

    this.coinDisburstmentService.getDataLog(this.pagination).subscribe(
      res => {
        console.log('res', res);
        
        Page.renderPagination(this.pagination, res.data);
        this.rows = res.data.data;
        this.onLoad = false;
        this.loadingIndicator = false;
      }, err => {
        console.error(err);
        this.onLoad = false;
        this.loadingIndicator = false;
      }
    );
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

    this.coinDisburstmentService.getDataLog(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res.data);
      this.rows = res.data.data;
      this.loadingIndicator = false;
    });
  }

  onSort(event) {
    this.pagination.sort = event.column.prop;
    this.pagination.sort_type = event.newValue;
    this.pagination.page = 1;
    this.loadingIndicator = true;

    this.dataService.setToStorage("page", this.pagination.page);
    this.dataService.setToStorage("sort", event.column.prop);
    this.dataService.setToStorage("sort_type", event.newValue);

    this.coinDisburstmentService.getDataLog(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res.data);
      this.rows = res.data.data;
      this.loadingIndicator = false;
    });
  }

  updateFilter(string) {
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

    this.coinDisburstmentService.getDataLog(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res.data);
      this.rows = res.data.data;
      this.loadingIndicator = false;
    });
  }

  onDocUpload(row) {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.panelClass = 'scrumboard-card-dialog';
    dialogConfig.data = {type: "data_log", data_log_id: row.id};

    this.dialogRef = this.dialog.open(ImportExchangeCoinComponent, dialogConfig);

    this.dialogRef.afterClosed().subscribe(response => {});
  }

  async download(row) {
    const formData = new FormData();
    formData.append("cd_approval_id", row.id);

    if (row.status_user === "pic") formData.append("access_type", row.status_user);
    
    try {
      this.dataService.showLoading(true);
      
      const response = await this.coinDisburstmentService.dataLogExport(formData).toPromise();
      
      const newBlob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url= window.URL.createObjectURL(newBlob);
      const link = document.createElement('a');
      link.href = url;

      const timestamp = new Date().getTime();
      const getTime = moment(timestamp).format("HHmmss");
      const encrypTime = CryptoJS.AES.encrypt(getTime, "timestamp").toString();
      link.download = `Export_DataLog-${encrypTime}.xlsx`;
      
      // this is necessary as link.click() does not work on the latest firefox
      link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));

      setTimeout(function () {
        // For Firefox it is necessary to delay revoking the ObjectURL
        window.URL.revokeObjectURL(url);
        link.remove();
      }, 100);
      
      this.dataService.showLoading(false);
    } catch (error) {
      console.log("err", error);
      this.dataService.showLoading(false);
      this.dialogService.openSnackBar(error);
      throw error;
    }
  }
}
