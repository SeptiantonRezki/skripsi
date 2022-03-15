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
  onLoad: boolean = true;
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
  listCompanies: any[] = [
    {id: 1, name: 'PT.Tempo Scan Pasific Tbk.'},
    {id: 2, name: 'PT.HM Sampoerna'},
    {id: 3, name: 'PT.Heinz ABC Indonesia'},
    {id: 4, name: 'PT.Konimex'},
    {id: 5, name: 'Others'},
  ];
  listCategories: any[] = [
    {id: 1, name: 'AIR MINERAL'},
    {id: 2, name: 'MAKANAN'},
    {id: 3, name: 'BUMBU MASAKAN'},
    {id: 4, name: 'OBAT2AN'},
    {id: 5, name: 'LAIN LAIN'},
  ];
  listStatus: any[] = [
    {id: 1, name: 'YA'},
    {id: 2, name: 'TIDAK'},
  ];
  formFilter: FormGroup;
  init: boolean = true;

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
      company: [[]],
      category: [[]],
      status: [null],
      date: [null],
      end_date: [null],
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

    this.submissionService.get(this.pagination).subscribe((res) => {
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

    this.submissionService.get(this.pagination).subscribe((res) => {
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
    this.pagination.sort_type = event.newValue.toUpperCase();
    this.pagination.page = 1;
    this.loadingIndicator = true;

    this.dataService.setToStorage("page", this.pagination.page);
    this.dataService.setToStorage("sort", sortName);
    this.dataService.setToStorage("sort_type", event.newValue.toUpperCase());

    this.submissionService.get(this.pagination).subscribe((res) => {
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
    this.loadingIndicator = true;

    this.submissionService.get(this.pagination).subscribe(
      (res) => {
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
      purchase_price: item.purchase_price.raw,
      selling_price: item.selling_price.raw,
    };
    this.dataService.showLoading(true);
    this.submissionService
      .putApprove(body, { product_id: item.id })
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
      .putDisapprove(null, { product_id: this.selectedItem.id })
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
    if(this.formFilter.get('company').value.length > 0 || this.formFilter.get('category').value.length > 0 || this.formFilter.get('status').value || this.formFilter.get('date').value && this.formFilter.get('end_date').value || this.formFilter.get('search').value) {
      this.getProducts();
      this.init = false;
    } else {
      this.dialogService.openSnackBar({ message: "Silahkan isi filter terlebih dahulu!" });
    };
  }
}
