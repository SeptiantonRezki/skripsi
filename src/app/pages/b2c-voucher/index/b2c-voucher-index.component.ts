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
import { B2CVoucherService } from 'app/services/b2c-voucher.service';

@Component({
  selector: 'app-b2c-voucher-index',
  templateUrl: './b2c-voucher-index.component.html',
  styleUrls: ['./b2c-voucher-index.component.scss']
})
export class B2CVoucherIndexComponent implements OnInit {
  rows: any[];
  selected: any[];
  id: any[];
  statusRow: any;
  loadingIndicator = true;
  reorderable = true;
  pagination: Page = new Page();
  offsetPagination: Number = null;

  rowsReimbursement: any[];
  loadingIndicatorReimbursement = true;
  paginationReimbursement: Page = new Page();
  offsetPaginationReimbursement: Number = null;

  onLoad: boolean;


  keyUp = new Subject<string>();

  @ViewChild('activeCell') activeCellTemp: TemplateRef<any>;
  @ViewChild('table') table: DatatableComponent;

  permission: any;
  roles: PagesName = new PagesName();
  constructor(
    private http: HttpClient,
    private fuseSplashScreen: FuseSplashScreenService,
    private router: Router,
    private dialogService: DialogService,
    private dataService: DataService,
    private b2cVoucherService: B2CVoucherService
  ) {
    this.onLoad = true;
    // this.selected = [];

    this.permission = this.roles.getRoles('principal.b2c_voucher');
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
    this.getB2CVoucherList();
    // this.getListReimbursement();
  }

  getB2CVoucherList() {
    const page = this.dataService.getFromStorage('page');
    const sort_type = this.dataService.getFromStorage('sort_type');
    const sort = this.dataService.getFromStorage('sort');

    this.pagination.page = page;
    this.pagination.sort_type = sort_type;
    this.pagination.sort = sort;

    this.offsetPagination = page ? (page - 1) : 0;

    this.b2cVoucherService.getListVoucher(this.pagination).subscribe(
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

    this.b2cVoucherService.getListVoucher(this.pagination).subscribe(res => {
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

    this.b2cVoucherService.getListVoucher(this.pagination).subscribe(res => {
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

    this.b2cVoucherService.getListVoucher(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res.data);
      this.rows = res.data ? res.data.data : [];
      this.loadingIndicator = false;
    });
  }

  directDetail(param?: any): void {
    this.dataService.setToStorage('detail_voucher_b2c', null);
    this.router.navigate(['b2c-voucher', 'detail', param.id]);
  }

  editVoucher(param?: any): void {
    this.dataService.setToStorage('detail_voucher_b2c', null);
    this.router.navigate(['b2c-voucher', 'edit', param.id]);
  }

  // LIST REIMBURSEMENT ZONE
  getListReimbursement() {
    const page = this.dataService.getFromStorage('page');
    const sort_type = this.dataService.getFromStorage('sort_type');
    const sort = this.dataService.getFromStorage('sort');

    this.paginationReimbursement.page = page;
    this.paginationReimbursement.sort_type = sort_type;
    this.paginationReimbursement.sort = sort;

    this.offsetPaginationReimbursement = page ? (page - 1) : 0;

    this.dataService.showLoading(true);
    this.loadingIndicatorReimbursement = true;
    this.b2cVoucherService.getListReimbursement(this.paginationReimbursement).subscribe(
      res => {
        Page.renderPagination(this.paginationReimbursement, res.data);
        this.rowsReimbursement = res.data ? res.data.data : [];

        // this.onLoad = false;
        this.loadingIndicatorReimbursement = false;
        this.dataService.showLoading(false);
      },
      err => {
        console.error(err);
        // this.onLoad = false;
        this.dataService.showLoading(false);
      }
    );
  }

  setPageReimbursement(pageInfo) {
    this.offsetPaginationReimbursement = pageInfo.offset;
    this.loadingIndicatorReimbursement = true;

    if (this.paginationReimbursement['search']) {
      this.paginationReimbursement.page = pageInfo.offset + 1;
    } else {
      this.dataService.setToStorage('page', pageInfo.offset + 1);
      this.paginationReimbursement.page = this.dataService.getFromStorage('page');
    }

    this.b2cVoucherService.getListReimbursement(this.paginationReimbursement).subscribe(res => {
      Page.renderPagination(this.paginationReimbursement, res.data);
      this.rowsReimbursement = res.data ? res.data.data : [];
      this.loadingIndicatorReimbursement = false;
    });
  }

  onSortReimbursement(event) {
    this.paginationReimbursement.sort = event.column.prop;
    this.paginationReimbursement.sort_type = event.newValue;
    this.paginationReimbursement.page = 1;
    this.loadingIndicatorReimbursement = true;

    this.dataService.setToStorage('page', this.paginationReimbursement.page);
    this.dataService.setToStorage('sort', event.column.prop);
    this.dataService.setToStorage('sort_type', event.newValue);

    this.b2cVoucherService.getListReimbursement(this.paginationReimbursement).subscribe(res => {
      Page.renderPagination(this.paginationReimbursement, res.data);
      this.rowsReimbursement = res.data ? res.data.data : [];
      this.loadingIndicatorReimbursement = false;
    });
  }

  updateFilterReimbursement(string) {
    this.loadingIndicator = true;
    this.paginationReimbursement.search = string;

    if (string) {
      this.paginationReimbursement.page = 1;
      this.offsetPagination = 0;
    } else {
      const page = this.dataService.getFromStorage('page');
      this.paginationReimbursement.page = page;
      this.offsetPaginationReimbursement = page ? (page - 1) : 0;
    }

    this.b2cVoucherService.getListReimbursement(this.pagination).subscribe(res => {
      Page.renderPagination(this.paginationReimbursement, res.data);
      this.rowsReimbursement = res.data ? res.data.data : [];
      this.loadingIndicatorReimbursement = false;
    });
  }

  deleteVoucher(id: any) {
    this.id = id;
    const data = {
      titleDialog: 'Hapus Voucher',
      captionDialog: 'Apakah anda yakin untuk menghapus voucher ini ?',
      confirmCallback: this.confirmDelete.bind(this),
      buttonText: ['Hapus', 'Batal']
    };
    this.dialogService.openCustomConfirmationDialog(data);
  }

  confirmDelete() {
    this.b2cVoucherService.deleteVoucher({ voucher_id: this.id }).subscribe(res => {
      if (res.status) {
        this.dialogService.brodcastCloseConfirmation();
        this.getB2CVoucherList();

        this.dialogService.openSnackBar({ message: 'Data Berhasil Dihapus' });
      }
    });
  }

}
