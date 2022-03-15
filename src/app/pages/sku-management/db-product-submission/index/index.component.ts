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
  init: boolean = true;
  onLoad: boolean = true;
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
  approverType: string;
  approvalStatusActive: any;
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
  listCategories: any[] = [
    {id: 1, name: 'AIR MINERAL'},
    {id: 2, name: 'MAKANAN'},
    {id: 3, name: 'BUMBU MASAKAN'},
    {id: 4, name: 'OBAT2AN'},
    {id: 5, name: 'LAIN LAIN'},
  ];
  listStatus: any[] = [
    {id: 1, name: 'Approver Produk DB'},
    {id: 2, name: 'Approver 1'},
  ];
  formFilter: FormGroup;

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
      category: [[]],
      status: [[]],
      search: ['']
    });
  }

  updateFilter(string) {
    this.loadingIndicator = true;
    this.pagination.search = string;

    if (string) {
      this.pagination.page = 1;
      this.offsetPagination = 0;
    } else {
      const page = this.dataService.getFromStorage("page");
      this.pagination.page = page;
      this.offsetPagination = page ? page - 1 : 0;
    }

    this.submissionService.getDb(this.pagination).subscribe((response) => {
      const res = response.data ? response.data : {};
      Page.renderPagination(this.pagination, res);
      this.rows = res.data ? res.data : [];
      this.loadingIndicator = false;
    });
  }

  setPage(pageInfo) {
    this.offsetPagination = pageInfo.offset;
    this.loadingIndicator = true;

    if (this.pagination["search"]) {
      this.pagination.page = pageInfo.offset + 1;
    } else {
      this.dataService.setToStorage("page", pageInfo.offset + 1);
      this.pagination.page = this.dataService.getFromStorage("page");
    }

    this.submissionService.getDb(this.pagination).subscribe((response) => {
      const res = response.data ? response.data : {};
      Page.renderPagination(this.pagination, res);
      this.rows = res.data ? res.data : [];
      this.loadingIndicator = false;
    });
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
    this.pagination.page = 1;
    this.loadingIndicator = true;

    this.dataService.setToStorage("page", this.pagination.page);
    this.dataService.setToStorage("sort", sortName);
    this.dataService.setToStorage("sort_type", event.newValue);

    this.submissionService.getDb(this.pagination).subscribe((response) => {
      const res = response.data ? response.data : {};
      Page.renderPagination(this.pagination, res);
      this.rows = res.data ? res.data : [];
      this.loadingIndicator = false;
    });
  }

  approvalStatusChange(value) {
    this.approvalStatusActive = value.name;
    this.pagination.status = value.id;
    this.pagination.page = 1;
    this.loadingIndicator = true;

    this.dataService.setToStorage("page", this.pagination.page);
    this.dataService.setToStorage("sort", "");
    this.dataService.setToStorage("sort_type", this.pagination.sort_type);

    this.submissionService.getDb(this.pagination).subscribe((response) => {
      const res = response.data ? response.data : {};
      Page.renderPagination(this.pagination, res);
      this.rows = res.data ? res.data : [];
      this.loadingIndicator = false;
    });
  }

  getProducts() {
    const page = this.dataService.getFromStorage("page");
    const sort_type = this.dataService.getFromStorage("sort_type");
    const sort = this.dataService.getFromStorage("sort");

    this.pagination.page = page;
    this.pagination.sort_type = sort_type;
    this.pagination.sort = sort;

    this.offsetPagination = page ? page - 1 : 0;

    this.submissionService.getDb(this.pagination).subscribe(
      (response) => {
        const res = response.data ? response.data : {};
        Page.renderPagination(this.pagination, res);
        const approverType = this.approvalStatus.filter(
          (item) => item.id === res.approver.type
        );
        this.approverType = approverType.length ? approverType[0]["name"] : "";
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
    const status = this.selectedItem.status.toLowerCase();
    const productId = this.selectedItem.id;
    this.dataService.showLoading(true);
    this.dialogService.brodcastCloseConfirmation();
    if (status === "approver 1") {
      this.submissionService
        .putDisapprove1(null, {
          product_id: productId,
        })
        .subscribe(this.submitSuccess.bind(this), this.submitError.bind(this));
    }
    if (status === "approver produk db") {
      this.submissionService
        .putDisapproveDbProduct(null, {
          product_id: productId,
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
    if(this.formFilter.get('category').value.length > 0 || this.formFilter.get('status').value.length > 0 || this.formFilter.get('search').value) {
      this.getProducts();
      this.init = false;
    } else {
      this.dialogService.openSnackBar({ message: "Silahkan isi filter terlebih dahulu!" });
    };
  }
}
