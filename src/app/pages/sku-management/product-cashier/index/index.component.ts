import { Component, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { Subject, Observable } from "rxjs";
import { DatatableComponent } from "@swimlane/ngx-datatable";
import { Page } from "app/classes/laravel-pagination";
import { DataService } from "app/services/data.service";
import { ProductCashierService } from "app/services/sku-management/product-cashier.service";
import { PagesName } from "app/classes/pages-name";
import { DialogService } from "app/services/dialog.service";

@Component({
  selector: "app-cashier-index",
  templateUrl: "./index.component.html",
  styleUrls: ["./index.component.scss"],
})
export class CashierIndexComponent implements OnInit {
  onLoad: boolean = true;
  loadingIndicator: boolean = true;
  reorderable: boolean = true;
  pagination: Page = new Page();
  offsetPagination: any;
  rows: any[];
  roles: PagesName = new PagesName();
  permission: any;
  id: any[];

  keyUp = new Subject<string>();

  @ViewChild(DatatableComponent)
  table: DatatableComponent;

  @ViewChild("activeCell")
  activeCellTemp: TemplateRef<any>;

  constructor(
    private dataService: DataService,
    private productCashierService: ProductCashierService,
    private dialogService: DialogService
  ) {
    this.permission = this.roles.getRoles("principal.produk_kasir");
    const observable = this.keyUp
      .debounceTime(500)
      .distinctUntilChanged()
      .flatMap((search) => {
        return Observable.of(search).delay(500);
      })
      .subscribe((data) => {
        this.updateFilter(data);
      });
  }

  ngOnInit() {
    this.getProducts();
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

    this.productCashierService.get(this.pagination).subscribe((res) => {
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

    this.productCashierService.get(this.pagination).subscribe((res) => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data ? res.data : [];
      this.loadingIndicator = false;
    });
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

    this.productCashierService.get(this.pagination).subscribe((res) => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data ? res.data : [];
      this.loadingIndicator = false;
    });
  }

  deleteProduct(id): void {
    this.id = id;
    let data = {
      titleDialog: "Hapus Produk",
      captionDialog: "Apakah anda yakin untuk menghapus Produk ini ?",
      confirmCallback: this.confirmDelete.bind(this),
      buttonText: ["Hapus", "Batal"],
    };
    this.dialogService.openCustomConfirmationDialog(data);
  }

  confirmDelete() {
    this.productCashierService.delete({ product_id: this.id }).subscribe(
      (res) => {
        this.dialogService.brodcastCloseConfirmation();
        this.dialogService.openSnackBar({ message: "Data Berhasil Dihapus" });

        this.getProducts();
      },
      (err) => {
        console.log(err);
      }
    );
  }

  getProducts() {
    const page = this.dataService.getFromStorage("page");
    const sort_type = this.dataService.getFromStorage("sort_type");
    const sort = this.dataService.getFromStorage("sort");

    this.pagination.page = page;
    this.pagination.sort_type = sort_type;
    this.pagination.sort = sort;

    this.offsetPagination = page ? page - 1 : 0;

    this.productCashierService.get(this.pagination).subscribe(
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

  onSelect(event: any) {}
}
