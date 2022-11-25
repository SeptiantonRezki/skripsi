import { Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { Page } from 'app/classes/laravel-pagination';
import { PagesName } from 'app/classes/pages-name';
import { DataService } from 'app/services/data.service';
import { DialogService } from 'app/services/dialog.service';
import { LanguagesService } from 'app/services/languages/languages.service';
import { LotteryService } from "../../../../services/dte/lottery.service";
import { Observable, Subject } from 'rxjs';
import moment from 'moment';
import * as CryptoJS from 'crypto-js';

@Component({
  selector: 'app-lottery',
  templateUrl: './lottery.component.html',
  styleUrls: ['./lottery.component.scss']
})
export class LotteryComponent implements OnInit {
  rows: any[];
  selected: any[];
  id: any;

  loadingIndicator = true;
  reorderable = true;
  pagination: Page = new Page();
  onLoad: boolean;

  @ViewChild(DatatableComponent)
  table: DatatableComponent;

  @ViewChild("activeCell")
  activeCellTemp: TemplateRef<any>;

  @ViewChild('downloadLinkDetailCoupon') downloadLinkDetailCoupon: ElementRef;
  @ViewChild('downloadLinkCoupon') downloadLinkCoupon: ElementRef;

  keyUp = new Subject<string>();
  dateNow: any;

  listLevelArea: any[];
  list: any;
  areaFromLogin;
  formFilter: FormGroup;
  filterArea: Boolean;

  permission: any;
  roles: PagesName = new PagesName();

  offsetPagination: any;
  area_id_list: any = [];

  // 2 geotree property
  endArea: String;
  lastLevel: any;

  constructor(
    private router: Router,
    private dialogService: DialogService,
    private dataService: DataService,
    private formBuilder: FormBuilder,
    private lotteryService: LotteryService,
    private ls: LanguagesService,
    private translate: TranslateService
  ) {
    const observable = this.keyUp.debounceTime(1000)
      .distinctUntilChanged()
      .flatMap(search => {
        return Observable.of(search).delay(500);
      })
      .subscribe(data => {
        this.updateFilter(data);
      });
  }

  ngOnInit() {
    this.getLottery();
  }

  getLottery() {
    const page = this.dataService.getFromStorage("page");
    const sort_type = this.dataService.getFromStorage("sort_type");
    const sort = this.dataService.getFromStorage("sort");

    this.pagination.page = page;
    this.pagination.sort_type = sort_type;
    this.pagination.sort = sort;

    this.offsetPagination = page ? (page - 1) : 0;

    this.lotteryService.get(this.pagination).subscribe(
      res => {
        Page.renderPagination(this.pagination, res.data);
        this.rows = res.data ? res.data.data : [];

        this.onLoad = false;
        this.loadingIndicator = false;
      },
      err => {
        console.error(err);
        this.onLoad = false;
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

    this.lotteryService.get(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res.data);
      this.rows = res.data ? res.data.data : [];
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

    this.lotteryService.get(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res.data);
      this.rows = res.data ? res.data.data : [];
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
      const page = this.dataService.getFromStorage("page");
      this.pagination.page = page;
      this.offsetPagination = page ? (page - 1) : 0;
    }

    this.lotteryService.get(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res.data);
      this.rows = res.data ? res.data.data : [];
      this.loadingIndicator = false;
    });
  }

  directEdit(param?: any): void {
    this.dataService.setToStorage('detail_lottery', param);
    this.router.navigate(['dte', 'lottery', 'edit']);
  }
  
  deleteTp(id) {
    this.id = id;
    let data = {
      titleDialog: 'Hapus Undian',
      captionDialog: 'Apakah anda yakin untuk menghapus data ini?',
      confirmCallback: this.confirmDelete.bind(this),
      buttonText: [ this.translate.instant('global.button.delete'), this.translate.instant('global.button.cancel') ]
    };
    this.dialogService.openCustomConfirmationDialog(data);
  }

  copyLink(data) {
    const linkLottery = 'retailer://link/undian/' + data.id;
    document.addEventListener('copy', (e: ClipboardEvent) => {
      e.clipboardData.setData('text/plain', (linkLottery));
      e.preventDefault();
      document.removeEventListener('copy', null);
    });
    document.execCommand('copy');
    this.dialogService.openSnackBar({ message: this.translate.instant('global.messages.text25', { status: this.translate.instant('global.label.copy_link')}) });
  }

  confirmDelete() {
    this.lotteryService.delete({ id: this.id }).subscribe(res => {
      if (res.status) {
        this.dialogService.brodcastCloseConfirmation();
        this.getLottery();

        this.dialogService.openSnackBar({ message: this.translate.instant('global.messages.text25', { status: this.translate.instant('global.button.delete')}) });
      }
    });
  }

  directDetail(param?: any): void {
    this.dataService.setToStorage('detail_lottery', param);
    this.router.navigate(['dte', 'lottery', 'detail']);
  }

  async exportDetailCoupon(param?: any) {
    this.dataService.showLoading(true);
    let fd = new FormData();
    fd.append('lottery_id', param.id);

    try {
      const response = await this.lotteryService.exportDetailCoupon(fd).toPromise();
      const newBlob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url= window.URL.createObjectURL(newBlob);
      const link = document.createElement('a');
      link.href = url;

      const timestamp = new Date().getTime();
      const getTime = moment(timestamp).format("HHmmss");
      const encryptTime = CryptoJS.AES.encrypt(getTime, "timestamp").toString();
      link.download = `Export-Detail_${param.name}-${encryptTime}.xlsx`;
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
      throw error;
    }
  }

  async exportCoupon(param?: any) {
    this.dataService.showLoading(true);
    let fd = new FormData();
    fd.append('lottery_id', param.id);
    
    try {
      const response = await this.lotteryService.exportCoupon(fd).toPromise();
      const newBlob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url= window.URL.createObjectURL(newBlob);
      const link = document.createElement('a');
      link.href = url;

      const timestamp = new Date().getTime();
      const getTime = moment(timestamp).format("HHmmss");
      const encryptTime = CryptoJS.AES.encrypt(getTime, "timestamp").toString();
      link.download = `Export_${param.name}-${encryptTime}.xlsx`;
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
      throw error;
    }
  }
}
