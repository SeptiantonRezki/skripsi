import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from "@angular/forms";
import { Page } from 'app/classes/laravel-pagination';
import { Subject, Observable, ReplaySubject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { PanelMitraService } from 'app/services/user-management/private-label/panel-mitra.service';
import { DialogService } from 'app/services/dialog.service';
import { PagesName } from 'app/classes/pages-name';
import { DataService } from 'app/services/data.service';
import { commonFormValidator } from "app/classes/commonFormValidator";

@Component({
  selector: 'app-panel-mitra-create',
  templateUrl: './panel-mitra-create.component.html',
  styleUrls: ['./panel-mitra-create.component.scss']
})
export class PanelMitraCreateComponent implements OnInit {
  onLoad: boolean;
  @ViewChild('containerScroll') private myScrollContainer: ElementRef;

  rows: any[];
  selected: any[];
  id: any;
  listFilterCategory: any[];
  listFilterProducts: any[];
  listFilterSupplier: any[];
  // filterCategory: any[] = [ { name: 'Semua Kategori', id: '' }, ];
  // filterProducts: any[] = [ { name: 'Semua Produk', id: '' }, ];
  filterCategory: any[];
  filterProducts: any[];
  filterSupplier: any[];

  formInput: FormGroup;
  formFilter: FormGroup;
  filterProdukSearch = new FormControl();
  private _onDestroy = new Subject<void>();

  loadingIndicator = true;
  reorderable = true;
  pagination: Page = new Page();
  offsetPagination: any;
  // allRowsSelected: boolean;
  // allRowsSelectedValid: boolean;
  
  isSelected: boolean;

  keyUp = new Subject<string>();
  permission: any;
  roles: PagesName = new PagesName();

  constructor(
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private panelMitraService: PanelMitraService,
    private dialogService: DialogService,
    private dataService: DataService,
  ) {
    this.onLoad = false;
    this.selected = [];
    this.permission = this.roles.getRoles('principal.supplierpanelmitra');
    this.listFilterCategory = [ { name: 'Semua Kategori', id: '' }, ...this.activatedRoute.snapshot.data["listCategory"].data ];
    this.listFilterSupplier = [ { name: 'Pilih Supplier', id: '' }, ...this.activatedRoute.snapshot.data["listSupplierCompany"].data.data ];
    this.filterCategory = this.listFilterCategory;
    this.filterSupplier = this.listFilterSupplier;
    // this.allRowsSelected = false;
    // this.allRowsSelectedValid = false;
    this.isSelected = false;
  }

  ngOnInit() {
    // this.formFilter = this.formBuilder.group({
      // filtercategory: "",
      // filterproduct: "",
      // filterSupplier: "",
    // });
    this.formInput = this.formBuilder.group({
      filtercategory: "",
      filterproduct: ["", Validators.required],
      filtersupplier: ["", Validators.required],
    });
    this.getFilterProduct();
    this.getListMitra();
  }
  
  getFilterProduct(value?: any) {
    console.log('kk', this.formInput.get('filtercategory').value);
    this.panelMitraService.getFilterProduct({ param: value || '', categoryId: this.formInput.get('filtercategory').value }).subscribe(res => {
      if (res.status == 'success') {
        this.listFilterProducts =  [ { name: 'Pilih Produk', id: '' }, ...res.data ];
        this.filterProducts = this.listFilterProducts.map((v) => ({...v}));
      } else {
        this.listFilterProducts = [ { name: 'Pilih Produk', id: '' }, ];
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
    this.getFilterProduct();
  }

  getListMitra() {
    this.panelMitraService.getListMitra().subscribe(res => {
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

  onSelect({ selected }) {
    // console.log(arguments);
    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);
  }
  
  // selectFnn(allRowsSelected: any) {
  //   this.allRowsSelected = allRowsSelected;
  //   this.allRowsSelectedValid = allRowsSelected;
  //   console.log('selectFnn', arguments);
  //   console.log('allRowsSelected_', allRowsSelected);
  // }

  setPage(pageInfo) {
    this.offsetPagination = pageInfo.offset;
    this.loadingIndicator = true;
    if (this.pagination['search']) {
      this.pagination.page = pageInfo.offset + 1;
    } else {
      this.dataService.setToStorage("page", pageInfo.offset + 1);
      this.pagination.page = this.dataService.getFromStorage("page");
    }

    this.panelMitraService.getListMitra(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res.data);
      this.rows = res.data.data;
      this.loadingIndicator = false;
      // this.allRowsSelected = false;
      // this.allRowsSelectedValid = false;
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

    this.panelMitraService.getListMitra(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res.data);
      this.rows = res.data.data;
      this.loadingIndicator = false;
    });
  }

  getId(row) {
    return row.id;
  }

  onSave() {
    if (this.formInput.valid && this.selected.length > 0) {
      const body = {
        product_id: this.formInput.get('filterproduct').value,
        supplier_company_id: this.formInput.get('filtersupplier').value,
        wholesaler_id: this.selected.map((item) => item.id)
      };
      this.panelMitraService.create(body).subscribe(res => {
        this.dialogService.openSnackBar({
          message: "Berhasil Menyimpan Data"
        });
        }, err => {
          console.log('err', err);
          this.dialogService.openSnackBar({
            message: err.error.message
          });
        }
      );
    } else {
      commonFormValidator.validateAllFields(this.formInput);
      if (this.selected.length == 0) {
        this.dialogService.openSnackBar({
          message: "Belum ada data yg terpilih"
        });
      } else {
        try {
          this.myScrollContainer.nativeElement.scrollTop = 0;
        } catch (err) {
          console.log('Scrolling Error', err);
        }
      }
    }
  }

}
