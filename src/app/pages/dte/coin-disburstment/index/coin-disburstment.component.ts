import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { DateAdapter } from '@angular/material';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { Page } from 'app/classes/laravel-pagination';
import { PagesName } from 'app/classes/pages-name';
import { DataService } from 'app/services/data.service';
import { DialogService } from 'app/services/dialog.service';
import { CoinDisburstmentService } from 'app/services/dte/coin-disburstment.service';
import { LanguagesService } from 'app/services/languages/languages.service';
import moment from 'moment';
import { Observable, Subject } from 'rxjs';

@Component({
  selector: 'app-coin-disburstment',
  templateUrl: './coin-disburstment.component.html',
  styleUrls: ['./coin-disburstment.component.scss'],
})
export class CoinDisburstmentComponent implements OnInit {
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
  @ViewChild('downloadLink') downloadLink: ElementRef;

  pageName = this.translate.instant('dte.coin_disbursement.text1');
  titleParam = {entity: this.pageName}
  selectedTab = new FormControl(0);

  constructor(
    private dialogService: DialogService,
    private adapter: DateAdapter<any>,
    private dataService: DataService,
    private coinDisburstmentService: CoinDisburstmentService,
    private router: Router,
    private ls: LanguagesService,
    private translate: TranslateService,
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

    this.coinDisburstmentService.get(this.pagination).subscribe(
      res => {
        Page.renderPagination(this.pagination, res);
        this.rows = res.data;
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

    this.coinDisburstmentService.get(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data;
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

    this.coinDisburstmentService.get(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data;
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

    this.coinDisburstmentService.get(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data;
      this.loadingIndicator = false;
    });
  }

  deleteCoinDisburstment(row: any) {
    this.id = row.id;
    let data = {
      titleDialog: this.translate.instant('global.label.delete_entity', this.titleParam),
      captionDialog: this.translate.instant('global.messages.delete_confirm', {entity: this.pageName, index: ""}),
      confirmCallback: this.confirmDelete.bind(this),
      buttonText: [this.translate.instant('global.button.delete'), this.translate.instant('global.button.cancel')]
    };
    this.dialogService.openCustomConfirmationDialog(data);
  }

  confirmDelete() {
    this.dataService.showLoading(true);
    this.coinDisburstmentService.delete({ coin_id: this.id }).subscribe(res => {
      this.dialogService.brodcastCloseConfirmation();
      this.dialogService.openSnackBar({ message: this.translate.instant('global.messages.text1') });
      this.dataService.showLoading(false);
      this.getCoinDisburstment();
    }, err => {
      console.log('err', err);
      this.dataService.showLoading(false);
    })
  }

  directEdit(row: any) {
    this.dataService.setToStorage("detail_coin_disburstment", row);
    this.router.navigate(["dte", "coin-disbursement", "edit"]);
  }

  async download(row: any) {
    this.dataService.showLoading({ show: true });
    const params = {
      area: 1,
      self_area: [1],
      last_self_area: [1],
      after_level: true,
      coin_disbursement_id: row.id,
      name: row.name,
      group_by: true
    }

    try {
      const response = await this.coinDisburstmentService.export(params).toPromise();
      const newBlob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url= window.URL.createObjectURL(newBlob);
      const link = document.createElement('a');
      link.href = url;

      const getTime = moment().format("YYYYMMDDHHmmss");
      link.download = `list-detail-penukaran-coin-${getTime}.xlsx`;
      
      // this is necessary as link.click() does not work on the latest firefox
      link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));

      setTimeout(function () {
        // For Firefox it is necessary to delay revoking the ObjectURL
        window.URL.revokeObjectURL(url);
        link.remove();
      }, 100);
      
      this.dataService.showLoading(false);
    } catch (error) {
      this.dataService.showLoading(false);
      throw error;
    }
  }

}
