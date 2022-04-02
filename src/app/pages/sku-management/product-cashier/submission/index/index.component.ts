import {
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
  ElementRef,
} from "@angular/core";
import { Subject, Observable } from "rxjs";
import { DatatableComponent } from "@swimlane/ngx-datatable";
import { Page } from "app/classes/laravel-pagination";
import { DataService } from "app/services/data.service";
import { PagesName } from "app/classes/pages-name";
import { DialogService } from "app/services/dialog.service";
import { MatDialogConfig, MatDialog } from "@angular/material";
import { ProductSubmissionService } from "app/services/sku-management/product-submission.service";
import { LanguagesService } from "app/services/languages/languages.service";
import { FormGroup, FormBuilder } from "@angular/forms";

@Component({
  selector: "cashier-submission",
  templateUrl: "./index.component.html",
  styleUrls: ["./index.component.scss"],
})
export class CashierSubmissionComponent implements OnInit {
  initTable: boolean = false;
  onLoad: boolean = true;
  onLoadInitial: boolean = true;
  loadingIndicator: boolean = true;
  reorderable: boolean = true;
  pagination: Page = new Page();
  offsetPagination: any;
  rows: any[];
  roles: PagesName = new PagesName();
  permission: any;
  id: any[];
  selectedItem: any;
  dialogRef: any;
  listBrands: any;
  listCategories: any;
  listStatus: any[] = [
    {id: 'all', name: 'SEMUA'},
    {id: '1', name: 'YA'},
    {id: '0', name: 'TIDAK'},
  ];
  formFilter: FormGroup;
  disabledEndDate: boolean = true;
  minEndDate: Date;

  keyUp = new Subject<string>();

  @ViewChild(DatatableComponent)
  table: DatatableComponent;

  @ViewChild("activeCell")
  activeCellTemp: TemplateRef<any>;

  constructor(
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private submissionService: ProductSubmissionService,
    private dialogService: DialogService,
    private dialog: MatDialog,
    private ls: LanguagesService
  ) {
    this.permission = this.roles.getRoles("principal.produk_kasir");
  }

  ngOnInit() {
    this.resetPagination();

    this.formFilter = this.formBuilder.group({
      brand: [null],
      category: [null],
      in_databank: ['all'],
      start_date: [null],
      end_date: [{ value: null, disabled: true}],
      search: ['']
    });

    const promises = ['getBrands', 'getCategories'].map(item => new Promise((resolve, reject) => this.submissionService[item]().subscribe(response => resolve(response.data), err => reject(err))));

    Promise.all(promises).then(res => {
      this.listBrands = res[0];
      this.listCategories = res[1];
      this.onLoadInitial = false
    })
      .catch(err => {
        this.dialogService.openSnackBar({ message: err.error.message });
        this.onLoadInitial = false;
      });
  }

  setPage(pageInfo) {
    this.offsetPagination = pageInfo.offset;
    this.loadingIndicator = true;

    this.dataService.setToStorage("page", pageInfo.offset + 1);
    this.pagination.page = this.dataService.getFromStorage("page");

    this.getProducts(true);
  }

  resetPagination() {
    this.dataService.setToStorage("page", 1);
    this.dataService.setToStorage("sort", "");
    this.dataService.setToStorage("sort_type", "");
  }

  onSort(event) {
    let sortName = event.column.prop.split(".")[0];

    // special case if table header prop name has different name than request
    if(sortName == 'brand' || sortName == 'category') {
      sortName = `${sortName}_id`;
    } else if(sortName == 'price') {
      let priceType = event.column.prop.split(".")[1];
      sortName = `${priceType}_${sortName}`
    };

    this.pagination.sort = sortName;
    this.pagination.sort_type = event.newValue.toUpperCase();

    this.dataService.setToStorage("sort", sortName);
    this.dataService.setToStorage("sort_type", event.newValue.toUpperCase());

    this.getProducts();
  }

  getProducts(page = false) {
    this.loadingIndicator = true;

    const sort_type = this.dataService.getFromStorage("sort_type");
    const sort = this.dataService.getFromStorage("sort");

    this.pagination.sort_type = sort_type;
    this.pagination.sort = sort;

    if(!page) {
      this.dataService.setToStorage("page", 1);
      this.pagination.page = 1;
      this.offsetPagination = 0;
    };

    let filter = this.formFilter.getRawValue();

    // mapping brand & category filter to correct request
    ['brand', 'category'].map(str => {
      if(filter[str]) {
        filter[str].map((item,i) => filter[`filter[${str}][${i}]`] = item);
        delete filter[str];
      };
    });
    // change in_databank to correct request
    if(this.formFilter.value.in_databank !== 'all') filter['filter[in_databank]'] = this.formFilter.value.in_databank;
    delete filter.in_databank;
    // mapping date filter to correct request
    ['start_date', 'end_date'].map(str => {
      if(filter[str]) {
        filter[`filter[created_period][${str}]`] = filter[str].format('YYYY-MM-DD');
        delete filter[str];
      };
    });

    this.submissionService.get({...this.pagination, ...filter}).subscribe(
      (response) => {
        const res = response.data ? response.data : {};
        Page.renderPagination(this.pagination, res);
        this.rows = res.data ? res.data : [];
        this.onLoad = false;
        this.loadingIndicator = false;
      },
      (err) => {
        console.error(err);
        this.onLoad = false;
      }
    );
  }

  approveProduct(item) {
    const body = {
      id: item.id,
      purchase_price: item.price.purchase.raw,
      selling_price: item.price.selling.raw,
    };
    this.dataService.showLoading(true);
    this.submissionService
      .putApproval(body)
      .subscribe((res) => {
        this.dataService.showLoading(false);
        this.dialogService.openSnackBar({ message: this.ls.locale.notification.popup_notifikasi.text22 });
        this.getProducts();
      });
  }

  disapproveProduct(item): void {
    this.selectedItem = item;
    let data = {
      titleDialog: "Hapus Produk",
      captionDialog: "Apakah anda yakin untuk menghapus Produk ini ?",
      confirmCallback: this.confirmDelete.bind(this),
      buttonText: ["Hapus", "Batal"],
    };
    this.dialogService.openCustomConfirmationDialog(data);
  }

  confirmDelete() {
    this.dataService.showLoading(true);
    this.dialogService.brodcastCloseConfirmation();
    this.submissionService
      .putApproval({
        _method: 'DELETE',
        id: this.selectedItem.id
      })
      .subscribe(
        (res) => {
          this.dataService.showLoading(false);
          this.dialogService.openSnackBar({ message: "Data Berhasil Dihapus" });
          this.getProducts();
        },
        (err) => {
          console.log(err);
        }
      );
  }

  onSelect(event: any) {}

  applyFilter() {
    this.initTable = true;
    this.getProducts();
  }

  changeStartDate() {
    if(this.formFilter.controls.start_date.value) {
      this.disabledEndDate = false;
      this.formFilter.controls.end_date.enable();
      if(this.formFilter.controls.end_date.value && this.formFilter.controls.start_date.value.unix() > this.formFilter.controls.end_date.value.unix()) this.formFilter.controls.end_date.patchValue(null);
      this.minEndDate = this.formFilter.controls.start_date.value.toDate();
    } else {
      this.disabledEndDate = true;
      this.formFilter.controls.end_date.patchValue(null);
      this.formFilter.controls.end_date.disable();
      this.minEndDate = null;
    };
  }
}
