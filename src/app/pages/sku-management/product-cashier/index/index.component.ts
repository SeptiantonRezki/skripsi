import { Component, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { DatatableComponent } from "@swimlane/ngx-datatable";
import { Page } from "app/classes/laravel-pagination";
import { DataService } from "app/services/data.service";
import { ProductCashierService } from "app/services/sku-management/product-cashier.service";
import { PagesName } from "app/classes/pages-name";

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

  @ViewChild(DatatableComponent)
  table: DatatableComponent;

  @ViewChild("activeCell")
  activeCellTemp: TemplateRef<any>;

  constructor(
    private dataService: DataService,
    private ProductCashierService: ProductCashierService
  ) {
    this.permission = this.roles.getRoles('principal.produk_kasir');
  }

  ngOnInit() {
    this.getProducts();
  }

  getProducts() {
    const page = this.dataService.getFromStorage("page");
    const sort_type = this.dataService.getFromStorage("sort_type");
    const sort = this.dataService.getFromStorage("sort");

    this.pagination.page = page;
    this.pagination.sort_type = sort_type;
    this.pagination.sort = sort;

    this.offsetPagination = page ? page - 1 : 0;

    this.ProductCashierService.get(this.pagination).subscribe(
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

  onSelect(event: any) {

  }

  onSort(event:any) {

  }

  setPage(event: any) {

  }

  deleteProduct(id: number) {

  }
}
