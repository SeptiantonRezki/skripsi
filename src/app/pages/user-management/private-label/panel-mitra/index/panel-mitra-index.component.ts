import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { Page } from 'app/classes/laravel-pagination';
import { Subject, Observable, ReplaySubject } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { DialogService } from 'app/services/dialog.service';
import { DataService } from 'app/services/data.service';
import { PagesName } from 'app/classes/pages-name';
import { FormGroup, FormBuilder, FormControl } from "@angular/forms";
import { MatSelect, MatDialogConfig, MatDialog } from '@angular/material';
import { takeUntil } from "rxjs/operators";

import { Endpoint } from '../../../../../classes/endpoint';
import { PanelMitraService } from 'app/services/user-management/private-label/panel-mitra.service';
import { HttpErrorResponse } from '@angular/common/http';
import { LanguagesService } from 'app/services/languages/languages.service';

@Component({
  selector: 'app-panel-mitra-index',
  templateUrl: './panel-mitra-index.component.html',
  styleUrls: ['./panel-mitra-index.component.scss']
})
export class PanelMitraIndexComponent implements OnInit {

  @ViewChild('singleSelect') singleSelect: MatSelect;

  onLoad: boolean;

  rows: any[];
  selected: any[];
  id: any;
  listFilterCategory: any[];
  listFilterProducts: any[];
  filterCategory: any[] = [{ name: 'Semua Kategori', id: '' },];
  filterProducts: any[] = [{ name: 'Semua Produk', id: '' },];
  formFilter: FormGroup;
  filterProdukSearch = new FormControl();
  private _onDestroy = new Subject<void>();

  loadingIndicator = true;
  reorderable = true;
  pagination: Page = new Page();
  endPoint: Endpoint = new Endpoint();
  offsetPagination: any;

  keyUp = new Subject<string>();

  permission: any;
  roles: PagesName = new PagesName();

  constructor(
    private dataService: DataService,
    private formBuilder: FormBuilder,
    private panelMitraService: PanelMitraService,
    private activatedRoute: ActivatedRoute,
    private dialogService: DialogService,
    private router: Router,
    private ls: LanguagesService
  ) {
    this.onLoad = true;
    this.selected = [];
    this.permission = this.roles.getRoles('principal.supplierpanelmitra');

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
    this.formFilter = this.formBuilder.group({
      filtercategory: "",
      filterproduct: "",
    });
    this.listFilterCategory = [{ name: 'Semua Kategori', id: '' }, ...this.activatedRoute.snapshot.data["listCategory"].data];
    this.filterCategory = this.listFilterCategory;
    this.getList();

    this.filterProdukSearch.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filteringProdukSearch();
      });
  }

  updateFilter(string) {
    this.loadingIndicator = true;
    this.pagination.search = string;

    if (this.formFilter.get('filtercategory').value) {
      this.pagination.category_id = this.formFilter.get('filtercategory').value;
    } else { this.pagination.category_id = null; }
    if (this.formFilter.get('filterproduct').value) {
      this.pagination.product_id = this.formFilter.get('filterproduct').value;
    } else { this.pagination.product_id = null; }

    if (string) {
      this.pagination.page = 1;
      this.offsetPagination = 0;
    } else {
      const page = this.dataService.getFromStorage("page");
      this.pagination.page = page;
      this.offsetPagination = page ? (page - 1) : 0;
    }

    this.panelMitraService.getList(this.pagination).subscribe(res => {
      if (res.status == 'success') {
        Page.renderPagination(this.pagination, res.data);
        this.rows = res.data.data;
        this.loadingIndicator = false;
      } else {
        this.dialogService.openSnackBar({ message:  this.ls.locale.global.messages.text11 });
        Page.renderPagination(this.pagination, res.data);
        this.rows = [];
        this.loadingIndicator = false;
      }
    }, err => {
      console.warn(err);
      this.dialogService.openSnackBar({ message:  this.ls.locale.global.messages.text11 });
      this.loadingIndicator = false;
    });
  }

  getFilterProduct(value?: any) {
    // console.log('kk', this.formFilter.get('filtercategory').value);
    this.panelMitraService.getFilterProduct({ param: value || '', categoryId: this.formFilter.get('filtercategory').value }).subscribe(res => {
      if (res.status == 'success') {
        this.listFilterProducts = [{ name: 'Semua Produk', id: '' }, ...res.data];
        this.filterProducts = this.listFilterProducts.map((v) => ({ ...v }));
      } else {
        this.listFilterProducts = [{ name: 'Semua Produk', id: '' },];
        this.filterProducts = this.listFilterProducts;
      }
    });
  }

  selectionChangeFilterCategory(event: any) {
    const e = event.value;
    this.getFilterProduct();
  }

  selectionChangeFilterProduct(event: any) {
    const e = event.value;
  }

  filteringProdukSearch() {
    if (!this.listFilterProducts) {
      return;
    }
    // get the search keyword
    let search = this.filterProdukSearch.value;
    if (!search) {
      this.filterProducts = this.listFilterProducts.slice();
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the products
    this.filterProducts = this.listFilterProducts.filter(item => item.name.toLowerCase().indexOf(search) > -1).map((v) => ({ ...v }));
  }

  getList() {
    const page = this.dataService.getFromStorage("page");
    const sort_type = this.dataService.getFromStorage("sort_type");
    const sort = this.dataService.getFromStorage("sort");

    this.pagination.page = page;
    this.pagination.sort_type = sort_type;
    this.pagination.sort = sort;

    this.offsetPagination = page ? (page - 1) : 0;

    this.panelMitraService.getList(this.pagination).subscribe(
      res => {
        if (res.status == 'success') {
          if (res.data.total < res.data.per_page && page !== 1) {
            this.dataService.setToStorage("page", 1);
            this.getList();
          } else {
            Page.renderPagination(this.pagination, res.data);
            this.rows = res.data.data;
            this.onLoad = false;
            this.loadingIndicator = false;
          }
        } else {
          Page.renderPagination(this.pagination, res.data);
          this.rows = [];
          this.dialogService.openSnackBar({
            message: res.status
          });
          this.onLoad = false;
          this.loadingIndicator = false;
        }
      },
      err => {
        console.error(err);
        this.onLoad = false;
        this.loadingIndicator = false;
      }
    );
  }

  onSelect({ selected }) {
    console.log(arguments);
    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);
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

    this.panelMitraService.getList(this.pagination).subscribe(res => {
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

    this.panelMitraService.getList(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res.data);
      this.rows = res.data.data;
      this.loadingIndicator = false;
    });
  }

  deleteById(id: any) {
    this.id = id;
    let data = {
      titleDialog: "Hapus Panel Mitra",
      captionDialog: "Apakah anda yakin untuk menghapus Panel Mitra ini?",
      confirmCallback: this.confirmDelete.bind(this),
      buttonText: ["Hapus", "Batal"]
    };
    this.dialogService.openCustomConfirmationDialog(data);
  }

  confirmDelete() {
    this.panelMitraService.delete({ panelMitraId: this.id }).subscribe(
      res => {
        this.dialogService.brodcastCloseConfirmation();
        this.dialogService.openSnackBar({ message: "Data Berhasil Dihapus" });
        this.getList();
      },
      err => {
        this.dialogService.openSnackBar({ message: err.error.message });
      }
    );
  }

  directEdit(item?: any): void {
    this.router.navigate(["user-management", "supplier-panel-mitra", "edit", item.id]);
  }

  async export(id) {
    try {
      const response = await this.panelMitraService.exportSupplierPanelMitra({ id: id }).toPromise();
      this.downLoadFile(response, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", `ExportPanelMitraSupplier_${new Date().toLocaleString()}.xls`);
      // this.downloadLink.nativeElement.href = response;
      // this.downloadLink.nativeElement.click();
      this.dataService.showLoading(false);
    } catch (error) {
      this.handleError(error);
      this.dataService.showLoading(false);
      // throw error;
    }
  }

  downLoadFile(data: any, type: string, fileName: string) {
    // It is necessary to create a new blob object with mime-type explicitly set
    // otherwise only Chrome works like it should
    var newBlob = new Blob([data], { type: type });

    // IE doesn't allow using a blob object directly as link href
    // instead it is necessary to use msSaveOrOpenBlob
    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveOrOpenBlob(newBlob);
      return;
    }

    // For other browsers:
    // Create a link pointing to the ObjectURL containing the blob.
    const url = window.URL.createObjectURL(newBlob);

    var link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    // this is necessary as link.click() does not work on the latest firefox
    link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));

    setTimeout(function () {
      // For Firefox it is necessary to delay revoking the ObjectURL
      window.URL.revokeObjectURL(url);
      link.remove();
    }, 100);
  }

  handleError(error) {
    console.log('Here')
    console.log(error)

    if (!(error instanceof HttpErrorResponse)) {
      error = error.rejection;
    }
    console.log(error);
    // alert('Open console to see the error')
  }

}
