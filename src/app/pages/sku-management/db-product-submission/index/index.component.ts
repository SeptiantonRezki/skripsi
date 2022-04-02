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
import { FormGroup, FormBuilder } from "@angular/forms";

@Component({
  selector: "db-product-submission",
  templateUrl: "./index.component.html",
  styleUrls: ["./index.component.scss"],
})
export class DbProductSubmissionComponent implements OnInit {
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
  hasApprovalPermission: any;
  id: any[];
  selectedItem: any;
  dialogRef: any;
  approvalStatus: any[] = [
    {
      id: null,
      name: "Semua",
    },
    {
      id: "approver-1",
      name: "Approver 1",
    },
    {
      id: "approver-produk-db",
      name: "Approver Produk DB",
    },
  ];
  listBrands: any;
  listCategories: any;
  listStatus: any;
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
    private dialog: MatDialog
  ) {
    this.permission = this.roles.getRoles("principal.pengajuan_produk_db");
  }

  ngOnInit() {
    this.resetPagination();

    this.formFilter = this.formBuilder.group({
      brand: [null],
      category: [null],
      status: [null],
      start_date: [null],
      end_date: [{ value: null, disabled: true}],
      search: ['']
    });

    const promises = ['getDbBrands', 'getDbCategories', 'getDbApprovers'].map(item => new Promise((resolve, reject) => this.submissionService[item]().subscribe(response => resolve(response.data), err => reject(err))));

    Promise.all(promises).then(res => {
      this.listBrands = res[0];
      this.listCategories = res[1];
      this.listStatus = res[2];
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
    const sortName = event.column.prop.split(".")[0];
    this.pagination.sort = sortName;
    this.pagination.sort_type = event.newValue;

    this.dataService.setToStorage("sort", sortName);
    this.dataService.setToStorage("sort_type", event.newValue);

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

    // mapping brand, category, status filter to correct request
    ['brand', 'category', 'status'].map(str => {
      if(filter[str]) {
        filter[str].map((item,i) => filter[`filter[${str}][${i}]`] = item);
        delete filter[str];
      };
    });
    // mapping date filter to correct request
    ['start_date', 'end_date'].map(str => {
      if(filter[str]) {
        filter[`filter[created_period][${str}]`] = filter[str].format('YYYY-MM-DD');
        delete filter[str];
      };
    });

    this.submissionService.getDb({...this.pagination, ...filter}).subscribe(
      (response) => {
        const res = response.data ? response.data : {};
        Page.renderPagination(this.pagination, res);
        this.rows = res.data ? res.data : [];
        this.onLoad = false;
        this.loadingIndicator = false;
      },
      (err) => {
        let msg = err.error.errors.search[0] ||  err.error.message;
        this.dialogService.openSnackBar({message:msg});
        this.onLoad = false;
        this.loadingIndicator = false;
      }
    );
  }

  onSelect(event: any) {}

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
    const status = this.selectedItem.approver.toLowerCase();
    const productId = this.selectedItem.id;
    this.dataService.showLoading(true);
    this.dialogService.brodcastCloseConfirmation();
    if (status === "approver 1") {
      this.submissionService
        .putApproval1({
          _method: 'DELETE',
          id: productId
        })
        .subscribe(this.submitSuccess.bind(this), this.submitError.bind(this));
    }
    if (status === "approver produk db") {
      this.submissionService
        .putApproval2({
          _method: 'DELETE',
          id: productId
        })
        .subscribe(this.submitSuccess.bind(this), this.submitError.bind(this));
    }
  }

  submitSuccess(res: any) {
    this.onLoad = false;
    this.dataService.showLoading(false);
    this.dialogService.openSnackBar({ message: "Data Berhasil Dihapus" });
    this.getProducts();
  }

  submitError(err: any) {
    this.onLoad = false;
    this.dataService.showLoading(false);
  }

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
