import { Component, OnInit, ViewChild, TemplateRef } from "@angular/core";
import { Page } from "app/classes/laravel-pagination";
import { Subject, Observable } from "../../../../../../node_modules/rxjs";
import { DatatableComponent } from "../../../../../../node_modules/@swimlane/ngx-datatable";
import { Router } from "../../../../../../node_modules/@angular/router";
import { DialogService } from "app/services/dialog.service";
import { DataService } from "app/services/data.service";
import { RetailerService } from "../../../../services/user-management/retailer.service";

@Component({
  selector: "app-retailer-index",
  templateUrl: "./retailer-index.component.html",
  styleUrls: ["./retailer-index.component.scss"]
})
export class RetailerIndexComponent {
  rows: any[];
  selected: any[];
  id: any[];

  loadingIndicator = true;
  reorderable = true;
  pagination: Page = new Page();
  onLoad: boolean;

  keyUp = new Subject<string>();

  @ViewChild("activeCell")
  @ViewChild(DatatableComponent)
  table: DatatableComponent;
  activeCellTemp: TemplateRef<any>;

  constructor(
    private router: Router,
    private dialogService: DialogService,
    private dataService: DataService,
    private retailerService: RetailerService
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
  }

  ngOnInit() {
    // this._fuseSplashScreenService.show();
    // this.http.get("api/ayo-b2b-user").subscribe((contacts: any) => {
    //   this.rows = contacts;
    //   this.loadingIndicator = false;
    // });
    // setTimeout(() => {
    //     this._fuseSplashScreenService.hide();
    // }, 3000);
    this.getRetailerList();
  }

  getRetailerList() {
    this.retailerService.get(this.pagination).subscribe(
      res => {
        Page.renderPagination(this.pagination, res);
        this.rows = res.data;
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

    console.log("Select Event", selected, this.selected);
  }

  setPage(pageInfo) {
    this.loadingIndicator = true;
    this.pagination.page = pageInfo.offset + 1;

    this.retailerService.get(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data;
      this.loadingIndicator = false;
    });
  }

  onSort(event) {
    this.pagination.sort = event.column.prop;
    this.pagination.sort_type = event.newValue;
    this.pagination.page = 1;
    this.loadingIndicator = true;

    console.log("check pagination", this.pagination);

    this.retailerService.get(this.pagination).subscribe(
      res => {
        Page.renderPagination(this.pagination, res);
        this.rows = res.data;
        this.loadingIndicator = false;
      },
      err => {
        this.loadingIndicator = false;
      }
    );
  }

  updateFilter(string) {
    this.loadingIndicator = true;
    this.table.offset = 0;
    this.pagination.search = string;
    this.pagination.page = 1;

    console.log(this.pagination);

    this.retailerService.get(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data;
      this.loadingIndicator = false;
    });
  }

  deleteWholesaler(id): void {
    this.id = id;
    let data = {
      titleDialog: "Hapus Retailer",
      captionDialog: "Apakah anda yakin untuk menghapus Retailer ini ?",
      confirmCallback: this.confirmDelete.bind(this),
      buttonText: ["Hapus", "Batal"]
    };
    this.dialogService.openCustomConfirmationDialog(data);
  }

  confirmDelete() {
    this.retailerService.delete({ wholesaler_id: this.id }).subscribe(
      res => {
        this.dialogService.brodcastCloseConfirmation();
        this.dialogService.openSnackBar({ message: "Data Berhasil Dihapus" });

        this.getRetailerList();
      },
      err => {
        this.dialogService.openSnackBar({ message: err.error.message });
      }
    );
  }

  directEdit(param?: any): void {
    this.dataService.setToStorage("detail_retailer", param);
    this.router.navigate(["user-management", "retailer", "edit"]);
  }
}
