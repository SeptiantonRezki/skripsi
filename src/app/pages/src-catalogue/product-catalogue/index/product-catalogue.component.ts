import { Component, OnInit, ViewChild, TemplateRef, ElementRef } from '@angular/core';
import { Page } from 'app/classes/laravel-pagination';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { Router } from '@angular/router';
import { DialogService } from 'app/services/dialog.service';
import { DataService } from 'app/services/data.service';
import { Observable, Subject } from 'rxjs';
import { ProductCatalogueService } from 'app/services/src-catalogue/product-catalogue.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDialogConfig, MatDialog } from '@angular/material';
import { CatalogueProductImportFileDialogComponent } from './import-file-dialog/import-file-dialog.component';
import { serviceServer, server } from '../../../../../environments/environment';
import { LanguagesService } from 'app/services/languages/languages.service';


@Component({
  selector: 'app-product-catalogue',
  templateUrl: './product-catalogue.component.html',
  styleUrls: ['./product-catalogue.component.scss']
})
export class ProductCatalogueComponent implements OnInit {
  formFilter: FormGroup;
  rows: any[];
  selected: any[];
  id: any[];

  loadingIndicator = true;
  reorderable = true;
  pagination: Page = new Page();
  onLoad: boolean;
  offsetPagination: any;

  keyUp = new Subject<string>();

  @ViewChild("activeCell")
  @ViewChild(DatatableComponent)
  table: DatatableComponent;
  activeCellTemp: TemplateRef<any>;
  @ViewChild('downloadLink') downloadLink: ElementRef;

  listCategory: Array<any>;
  statusFilter: Array<any> = [{ value: 'active', name: this.ls.locale.global.label.active }, { value: 'inactive', name: this.ls.locale.global.label.inactive }];
  dialogRef: any;
  vendor_id: any;

  constructor(
    private router: Router,
    private dialogService: DialogService,
    private dataService: DataService,
    private productCatalogueService: ProductCatalogueService,
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private ls: LanguagesService
  ) {
    this.onLoad = true;
    this.selected = [];

    const observable = this.keyUp.debounceTime(1000)
      .distinctUntilChanged()
      .flatMap(search => {
        return Observable.of(search).delay(500);
      })
      .subscribe(data => {
        this.updateFilter(data);
      });
    let profile = this.dataService.getDecryptedProfile();
    if (profile) this.vendor_id = profile.vendor_company_id;
  }

  ngOnInit() {
    this.getCategories();

    this.formFilter = this.formBuilder.group({
      category: [""],
      status: [""]
    })
    this.getProductCatalogue();
  }

  getCategories() {
    this.productCatalogueService.getCategories().subscribe(res => {
      this.listCategory = res.data;
    })
  }

  getProductCatalogue() {
    const page = this.dataService.getFromStorage("page");
    const sort_type = this.dataService.getFromStorage("sort_type");
    const sort = this.dataService.getFromStorage("sort");

    this.pagination.page = page;
    this.pagination.sort_type = sort_type;
    this.pagination.sort = sort;

    this.offsetPagination = page ? (page - 1) : 0;
    this.pagination['company_id'] = this.vendor_id ? this.vendor_id : null;


    this.loadingIndicator = true;
    this.productCatalogueService.get(this.pagination).subscribe(
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
  }

  setPage(pageInfo) {
    this.loadingIndicator = true;
    this.pagination.page = pageInfo.offset + 1;

    this.productCatalogueService.get(this.pagination).subscribe(res => {
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

    console.log("check pagination", this.pagination);

    this.productCatalogueService.get(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res.data);
      this.rows = res.data ? res.data.data : [];
      this.loadingIndicator = false;
    });
  }

  updateFilter(string) {
    this.loadingIndicator = true;
    this.table.offset = 0;
    this.pagination.search = string;
    this.pagination.page = 1;

    console.log(this.pagination);
    this.pagination['vendor_product_category_id'] = this.formFilter.get('category').value;
    this.pagination.status = this.formFilter.get('status').value;
    this.productCatalogueService.get(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res.data);
      this.rows = res.data ? res.data.data : [];
      this.loadingIndicator = false;
    });
  }

  directEdit(param?: any): void {
    this.dataService.setToStorage("detail_product_catalogue", param);
    this.router.navigate(["src-catalogue", "products", "edit"]);
  }

  directDetail(param?: any): void {
    this.dataService.setToStorage("detail_product_catalogue", param);
    this.router.navigate(["src-catalogue", "products", "detail"]);
  }

  deleteProduct(id): void {
    this.id = id;
    let data = {
      titleDialog: "Hapus Produk",
      captionDialog: "Apakah anda yakin untuk menghapus Produk ini ?",
      confirmCallback: this.confirmDelete.bind(this),
      buttonText: ["Hapus", "Batal"]
    };
    this.dialogService.openCustomConfirmationDialog(data);
  }

  confirmDelete() {
    this.productCatalogueService.delete({ product_id: this.id }).subscribe(
      res => {
        this.dialogService.brodcastCloseConfirmation();
        this.dialogService.openSnackBar({ message: "Data Berhasil Dihapus" });

        this.getProductCatalogue();
      },
      err => {
        // this.dialogService.openSnackBar({ message: err.error.message });
      }
    );
  }

  export() {
    this.dataService.showLoading(true);
    this.productCatalogueService.export({ company_id: this.vendor_id ? this.vendor_id : null }).subscribe(
      res => {
        console.log('resss', res);
        this.downloadLink.nativeElement.href = res.data;
        this.downloadLink.nativeElement.click();
        this.dataService.showLoading(false);
      },
      err => {
        this.dataService.showLoading(false);
      }
    )
  }

  import() {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.panelClass = 'scrumboard-card-dialog';
    dialogConfig.data = { password: 'P@ssw0rd', company_id: this.vendor_id };

    this.dialogRef = this.dialog.open(CatalogueProductImportFileDialogComponent, dialogConfig);

    this.dialogRef.afterClosed().subscribe(response => {
      if (response) {
        this.dialogService.openSnackBar({ message: this.ls.locale.global.messages.text8 });
        this.getProductCatalogue();
      }
    });
  }

  deleteAll() {

    let data = {
      titleDialog: "Hapus Semua SKU",
      captionDialog: "Apakah Anda Yakin untuk menghapus semua list SKU Anda?",
      tickbox: true,
      tickboxCaption: "Apakah anda yakin akan menghapus SEMUA PRODUK? Pastikan anda sudah backup data produk anda dengan Export Excel di halaman produk.",
      confirmCallback: this.confirmDeleteAll.bind(this),
      buttonText: ["Hapus", "Batal"]
    };
    this.dialogService.openCustomConfirmationDialog(data);
  }

  confirmDeleteAll() {
    this.productCatalogueService.deleteAll().subscribe(
      res => {
        this.dialogService.brodcastCloseConfirmation();
        this.dialogService.openSnackBar({ message: "Data Berhasil Dihapus" });

        this.getProductCatalogue();
      },
      err => {
      }
    );
  }

  renderStockName(stockName) {
    return stockName === 'in-stock' ? 'Tersedia' : 'Tidak Tersedia';
  }

}
