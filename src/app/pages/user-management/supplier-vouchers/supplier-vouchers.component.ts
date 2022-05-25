import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { Page } from 'app/classes/laravel-pagination';
import { Subject, Observable } from 'rxjs';
import { PagesName } from 'app/classes/pages-name';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { Router } from '@angular/router';
import { DialogService } from 'app/services/dialog.service';
import { DataService } from 'app/services/data.service';
import { MatDialog } from '@angular/material';
import { VoucherPrivateLabelService } from 'app/services/voucher-private-label.service';
import { LanguagesService } from 'app/services/languages/languages.service';
// import { voucherPrivateLabelService } from 'app/services/voucher-principal.service';
// import { GoogleTagManagerService } from 'app/services/gtm.service';

@Component({
  selector: 'app-supplier-vouchers',
  templateUrl: './supplier-vouchers.component.html',
  styleUrls: ['./supplier-vouchers.component.scss']
})
export class SupplierVouchersComponent implements OnInit {
  rows: any[];
  selected: any[];
  id: any[];

  loadingIndicator = true;
  reorderable = true;
  pagination: Page = new Page();
  onLoad: boolean;

  keyUp = new Subject<string>();

  permission: any;
  roles: PagesName = new PagesName();

  @ViewChild("activeCell")
  @ViewChild(DatatableComponent)

  table: DatatableComponent;
  activeCellTemp: TemplateRef<any>;

  offsetPagination: any;

  dialogRef: any;
  audienceSelected: any[] = []
  constructor(
    private router: Router,
    private dialogService: DialogService,
    private dataService: DataService,
    private voucherPrivateLabelService: VoucherPrivateLabelService,
    private dialog: MatDialog,
    private ls: LanguagesService,
  ) {
    this.onLoad = true;
    this.selected = [];

    this.permission = this.roles.getRoles('wholesaler.karyawan');
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
    const profile = this.dataService.getDecryptedProfile();
    this.getVoucherPrincipal();
  }

  getVoucherPrincipal() {
    const page = this.dataService.getFromStorage("page_supplier_vouchers");
    const sort_type = this.dataService.getFromStorage("sort_type_supplier_vouchers");
    const sort = this.dataService.getFromStorage("sort_supplier_vouchers");

    this.pagination.page = page;
    this.pagination.sort_type = sort_type;
    this.pagination.sort = sort;

    this.offsetPagination = page ? (page - 1) : 0;

    this.voucherPrivateLabelService.get(this.pagination).subscribe(
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

  onSelect({ selected }) {
    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);
    console.log("Select Event", selected, this.selected);
  }

  setPage(pageInfo) {
    this.offsetPagination = pageInfo.offset;
    this.loadingIndicator = true;

    if (this.pagination['search']) {
      this.pagination.page = pageInfo.offset + 1;
    } else {
      this.dataService.setToStorage("page_supplier_vouchers", pageInfo.offset + 1);
      this.pagination.page = this.dataService.getFromStorage("page_supplier_vouchers");
    }

    this.voucherPrivateLabelService.get(this.pagination).subscribe(res => {
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

    this.dataService.setToStorage("page_supplier_vouchers", this.pagination.page);
    this.dataService.setToStorage("sort_supplier_vouchers", event.column.prop);
    this.dataService.setToStorage("sort_type_supplier_vouchers", event.newValue);

    this.voucherPrivateLabelService.get(this.pagination).subscribe(res => {
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
      const page = this.dataService.getFromStorage("page_supplier_vouchers");
      this.pagination.page = page;
      this.offsetPagination = page ? (page - 1) : 0;
    }

    this.voucherPrivateLabelService.get(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res.data);
      this.rows = res.data ? res.data.data : [];
      this.loadingIndicator = false;
    });
  }

  directDetail(row?: any) {
    this.dataService.setToStorage('detail_voucher_principal', row);
    this.router.navigate(['user-management/supplier-vouchers', 'detail']);
  }

}
