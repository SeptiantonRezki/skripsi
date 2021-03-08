import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Page } from 'app/classes/laravel-pagination';
import { Subject, Observable } from 'rxjs';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { PagesName } from 'app/classes/pages-name';
import { HttpClient } from '@angular/common/http';
import { FuseSplashScreenService } from '@fuse/services/splash-screen.service';
import { Router } from '@angular/router';
import { DialogService } from 'app/services/dialog.service';
import { DataService } from 'app/services/data.service';
import { B2BVoucherInjectService } from 'app/services/b2b-voucher-inject.service';

@Component({
  selector: 'app-b2b-voucher-inject',
  templateUrl: './b2b-voucher-inject.component.html',
  styleUrls: ['./b2b-voucher-inject.component.scss']
})
export class B2BVoucherInjectComponent implements OnInit {
  rows: any[];
  selected: any[];
  id: any;
  statusRow: any;

  loadingIndicator = true;
  reorderable = true;
  pagination: Page = new Page();
  onLoad: boolean;

  offsetPagination: Number = null;

  keyUp = new Subject<string>();

  @ViewChild('activeCell') activeCellTemp: TemplateRef<any>;
  @ViewChild('table') table: DatatableComponent;

  // permission: any;
  roles: PagesName = new PagesName();
  permission: any;

  constructor(
    private http: HttpClient,
    private fuseSplashScreen: FuseSplashScreenService,
    private router: Router,
    private dialogService: DialogService,
    private dataService: DataService,
    private b2bVoucherInjectService: B2BVoucherInjectService
  ) {
    this.onLoad = true;
    // this.selected = [];

    this.permission = this.roles.getRoles('principal.inject_b2b_voucher');
    console.log(this.permission);

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
    this.getList();
  }

  getList() {
    const page = this.dataService.getFromStorage('page');
    const sort_type = this.dataService.getFromStorage('sort_type');
    const sort = this.dataService.getFromStorage('sort');

    this.pagination.page = page;
    this.pagination.sort_type = sort_type;
    this.pagination.sort = sort;

    this.offsetPagination = page ? (page - 1) : 0;

    this.b2bVoucherInjectService.get(this.pagination).subscribe(
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
      this.dataService.setToStorage('page', pageInfo.offset + 1);
      this.pagination.page = this.dataService.getFromStorage('page');
    }

    this.b2bVoucherInjectService.get(this.pagination).subscribe(res => {
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

    this.dataService.setToStorage('page', this.pagination.page);
    this.dataService.setToStorage('sort', event.column.prop);
    this.dataService.setToStorage('sort_type', event.newValue);

    this.b2bVoucherInjectService.get(this.pagination).subscribe(res => {
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
      const page = this.dataService.getFromStorage('page');
      this.pagination.page = page;
      this.offsetPagination = page ? (page - 1) : 0;
    }

    this.b2bVoucherInjectService.get(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res.data);
      this.rows = res.data ? res.data.data : [];
      this.loadingIndicator = false;
    });
  }

  directEdit(param?: any): void {
    this.dataService.setToStorage('detail_voucher_b2b_inject', param);
    this.router.navigate(['inject-b2b-voucher', 'edit']);
  }

  directDetail(param?: any): void {
    this.dataService.setToStorage('detail_voucher_b2b_inject', param);
    this.router.navigate(['inject-b2b-voucher', 'detail']);
  }

  deleteVoucher(id) {
    this.id = id;
    const data = {
      titleDialog: 'Hapus Voucher',
      captionDialog: 'Apakah anda yakin untuk menghapus voucher ini?',
      confirmCallback: this.confirmDelete.bind(this),
      buttonText: ['Hapus', 'Batal']
    };
    this.dialogService.openCustomConfirmationDialog(data);
  }

  confirmDelete() {
    this.b2bVoucherInjectService.delete({ voucher_id: this.id }).subscribe(res => {
      if (res.status) {
        this.dialogService.brodcastCloseConfirmation();
        this.getList();

        this.dialogService.openSnackBar({ message: 'Data Berhasil Dihapus' });
      }
    });
  }

  getStatusColor(status) {
    switch (status) {
      case "draft":
        return "mat-yellow-900-bg";
      case "need-approval":
        return "mat-red-800-bg";
      case "approved":
        return "mat-green-800-bg";
      case "published":
        return "mat-green-800-bg";
      default:
        return "mat-red-800-bg";
    }
  }

}
