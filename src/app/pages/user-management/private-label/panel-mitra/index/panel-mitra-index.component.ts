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
  filterCategory: any[] = [ { name: 'Semua Kategori', id: '' }, ];
  filterProducts: any[] = [ { name: 'Semua Produk', id: '' }, ];
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
  ) {
    this.onLoad = false;
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
    this.listFilterCategory = [ { name: 'Semua Kategori', id: '' }, ...this.activatedRoute.snapshot.data["listCategory"].data ];
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
        this.dialogService.openSnackBar({ message: "Terjadi Kesalahan Pencarian" });
        Page.renderPagination(this.pagination, res.data);
        this.rows = [];
        this.loadingIndicator = false;
      }
    }, err => {
      console.warn(err);
      this.dialogService.openSnackBar({ message: "Terjadi Kesalahan Pencarian" });
      this.loadingIndicator = false;
    });
  }

  getFilterProduct(value?: any) {
    console.log('kk', this.formFilter.get('filtercategory').value);
    this.panelMitraService.getFilterProduct({ param: value || '', categoryId: this.formFilter.get('filtercategory').value }).subscribe(res => {
      if (res.status == 'success') {
        this.listFilterProducts =  [ { name: 'Semua Produk', id: '' }, ...res.data ];
        this.filterProducts = this.listFilterProducts.map((v) => ({...v}));
      } else {
        this.listFilterProducts = [ { name: 'Semua Produk', id: '' }, ];
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
      this.filterProducts = this.listFilterProducts.filter(item => item.name.toLowerCase().indexOf(search) > -1).map((v)=>({...v}));
  }

  getList() {
    const page = this.dataService.getFromStorage("page");
    const sort_type = this.dataService.getFromStorage("sort_type");
    const sort = this.dataService.getFromStorage("sort");

    this.pagination.page = 1;
    this.pagination.sort_type = sort_type;
    this.pagination.sort = sort;

    this.offsetPagination = page ? (page - 1) : 0;

    this.panelMitraService.getList(this.pagination).subscribe(
      res => {
        if (res.status == 'success') {
          Page.renderPagination(this.pagination, res.data);
          this.rows = res.data.data;
        } else {
          Page.renderPagination(this.pagination, res.data);
          this.rows = [];
          this.dialogService.openSnackBar({
            message: res.status
          });
        }
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

  directDetail(item?: any): void {
    this.router.navigate(["user-management", "supplier-panel-mitra", "detail", item.id]);
  }

  directEdit(item?: any): void {
    this.router.navigate(["user-management", "supplier-panel-mitra", "edit", item.id]);
  }

}
