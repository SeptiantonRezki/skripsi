import { Component, OnInit, ViewChild, TemplateRef, Input } from '@angular/core';
import { Page } from 'app/classes/laravel-pagination';
import { Subject, Observable } from 'rxjs';
import { PagesName } from 'app/classes/pages-name';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { Router } from '@angular/router';
import { DialogService } from 'app/services/dialog.service';
import { DataService } from 'app/services/data.service';
import { MatDialog } from '@angular/material';
import { VoucherPrivateLabelService } from 'app/services/voucher-private-label.service';
import { _getComponentHostLElementNode } from '@angular/core/src/render3/instructions';
import { LanguagesService } from 'app/services/languages/languages.service';
// import { LanguagesService } from "app/services/languages/languages.service";

@Component({
  selector: 'app-voucher-principal-detail',
  templateUrl: './voucher-principal-detail.component.html',
  styleUrls: ['./voucher-principal-detail.component.scss']
})
export class VoucherPrincipalDetailComponent implements OnInit {
  @Input() activeCol: string[];
  @Input() dataType: string;

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
  voucherID: any;
  
  constructor(
    public router: Router,
    public dialogService: DialogService,
    public dataService: DataService,
    // public voucherPrincipalService: VoucherPrincipalService,
    public voucherPrivateLabelService: VoucherPrivateLabelService,
    public dialog: MatDialog,
    public ls: LanguagesService,
  ) {
    this.onLoad = true;
    this.selected = [];

    this.permission = this.roles.getRoles('wholesaler.karyawan');
    console.log(this.permission);
    this.voucherID = this.dataService.getFromStorage("detail_voucher_principal");

    const observable = this.keyUp.debounceTime(1000)
      .distinctUntilChanged()
      .flatMap(search => {
        return Observable.of(search).delay(500);
      })
      .subscribe(data => {
        this.updateFilter(data, true);
      });
  }

  ngOnInit() {
    this.getVoucherPrincipal(true);
  }

  getVoucherPrincipal(resetPage?) {
    console.log('voucherID', this.voucherID);
    const page = this.dataService.getFromStorage("page");
    const sort_type = this.dataService.getFromStorage("sort_type");
    const sort = this.dataService.getFromStorage("sort");

    this.pagination.page = resetPage ? 1 : page;
    this.pagination.per_page = 5;
    this.pagination.sort_type = sort_type;
    this.pagination.sort = sort;

    this.offsetPagination = this.pagination.page ? (this.pagination.page - 1) : 0;

    this.voucherPrivateLabelService.getDetail({ voucher_id: this.voucherID['id'] }, this.pagination, this.dataType).subscribe(
      res => {
        Page.renderPagination(this.pagination, res.data);
        this.rows = res.data ? res.data.data : [];
        console.log(res);
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
      this.dataService.setToStorage("page", pageInfo.offset + 1);
      this.pagination.page = this.dataService.getFromStorage("page");
    }

    this.voucherPrivateLabelService.getDetail({ voucher_id: this.voucherID['id'] }, this.pagination, this.dataType).subscribe(res => {
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

    this.voucherPrivateLabelService.getDetail({ voucher_id: this.voucherID['id'] }, this.pagination, this.dataType).subscribe(res => {
      Page.renderPagination(this.pagination, res.data);
      this.rows = res.data ? res.data.data : [];
      this.loadingIndicator = false;
    });
  }

  updateFilter(string, resetPage?) {
    this.loadingIndicator = true;
    this.pagination.search = string;

    if (string) {
      this.pagination.page = 1;
      this.offsetPagination = 0;
    } else {
      const page = this.dataService.getFromStorage("page");
      this.pagination.page = resetPage ? 1 : page;
      this.offsetPagination = this.pagination.page ? (this.pagination.page - 1) : 0;
    }

    this.voucherPrivateLabelService.getDetail({ voucher_id: this.voucherID['id'] }, this.pagination, this.dataType).subscribe(res => {
      Page.renderPagination(this.pagination, res.data);
      this.rows = res.data ? res.data.data : [];
      this.loadingIndicator = false;
    });
  }

}
