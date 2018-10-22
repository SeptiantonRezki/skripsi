import { Component, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { DataService } from "../../../../services/data.service";
import { Router } from "@angular/router";
import { FuseSplashScreenService } from "@fuse/services/splash-screen.service";
import { DialogService } from "../../../../services/dialog.service";
import { Page } from "../../../../classes/laravel-pagination";
import { Subject } from "rxjs/Subject";
import { Observable } from "rxjs/Observable";
import { DatatableComponent } from "@swimlane/ngx-datatable";
import { AdminPrincipalService } from "../../../../services/user-management/admin-principal.service";

@Component({
  selector: "app-admin-principal-index",
  templateUrl: "./admin-principal-index.component.html",
  styleUrls: ["./admin-principal-index.component.scss"]
})
export class AdminPrincipalIndexComponent {
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
    private http: HttpClient,
    private fuseSplashScreen: FuseSplashScreenService,
    private router: Router,
    private dialogService: DialogService,
    private dataService: DataService,
    private adminPrincipalService: AdminPrincipalService
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
    this.getAdminList();
  }

  getAdminList() {
    this.pagination.sort = "fullname";
    this.pagination.sort_type = "asc";
    
    this.adminPrincipalService.get(this.pagination).subscribe(
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
  }

  setPage(pageInfo) {
    this.loadingIndicator = true;
    this.pagination.page = pageInfo.offset + 1;

    this.adminPrincipalService.get(this.pagination).subscribe(res => {
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

    this.adminPrincipalService.get(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data;
      this.loadingIndicator = false;
    });
  }

  updateFilter(string) {
    this.loadingIndicator = true;
    this.table.offset = 0;
    this.pagination.search = string;
    this.pagination.page = 1;

    console.log(this.pagination);

    this.adminPrincipalService.get(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data;
      this.loadingIndicator = false;
    });
  }

  deleteUser(id): void {
    this.id = id;
    let data = {
      titleDialog: "Hapus Admin Principal",
      captionDialog: "Apakah anda yakin untuk menghapus Admin Principal ini ?",
      confirmCallback: this.confirmDelete.bind(this),
      buttonText: ["Hapus", "Batal"]
    };
    this.dialogService.openCustomConfirmationDialog(data);
  }

  confirmDelete() {
    this.adminPrincipalService.delete({ principal_id: this.id }).subscribe(
      res => {
        this.dialogService.brodcastCloseConfirmation();
        this.dialogService.openSnackBar({ message: "Data Berhasil Dihapus" });

        this.getAdminList();
      },
      err => {
        this.dialogService.openSnackBar({ message: err.error.message });
      }
    );
  }

  deleteAllUser(): void {
    if (this.selected.length > 0) {
      let data = {
        titleDialog: "Non-aktifkan Admin Principal",
        captionDialog: "Apakah anda yakin untuk menon-aktifkan data yang telah dipilih ?",
        confirmCallback: this.confirmAllDelete.bind(this),
        buttonText: ["Non-aktifkan", "Batal"]
      };
      this.dialogService.openCustomConfirmationDialog(data);
    } else {
      this.dialogService.openSnackBar({ message: 'Tidak ada admin principal yang dipilih'})
    }
  }

  confirmAllDelete() {
    let body = {
      ids: this.selected.filter(item => item.status === 'active').map(item => item.id)
    }

    this.adminPrincipalService.deleteMultiple(body).subscribe(
      res => {
        this.dialogService.brodcastCloseConfirmation();
        this.dialogService.openSnackBar({ message: "Data Berhasil Dihapus" });

        this.getAdminList();
        this.selected = [];
      },
      err => {
        this.dialogService.openSnackBar({ message: err.error.message });
      }
    );
  }

  directEdit(param?: any): void {
    this.dataService.setToStorage("detail_admin_principal", param);
    this.router.navigate(["user-management", "admin-principal", "edit"]);
  }
}
