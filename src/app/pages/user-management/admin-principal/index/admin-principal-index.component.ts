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
import { PagesName } from "app/classes/pages-name";
import { LanguagesService } from "app/services/languages/languages.service";

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

  offsetPagination: Number = null;

  keyUp = new Subject<string>();

  @ViewChild("activeCell") activeCellTemp: TemplateRef<any>;
  @ViewChild('table') table: DatatableComponent;

  permission: any;
  roles: PagesName = new PagesName();

  constructor(
    private http: HttpClient,
    private fuseSplashScreen: FuseSplashScreenService,
    private router: Router,
    private dialogService: DialogService,
    private dataService: DataService,
    private adminPrincipalService: AdminPrincipalService,
    private ls: LanguagesService
  ) {
    this.onLoad = true;
    this.selected = [];

    this.permission = this.roles.getRoles('principal.adminprincipal');
    console.log(this.permission);

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
    this.getAdminList();
  }

  getAdminList() {
    const page = this.dataService.getFromStorage("page");
    const sort_type = this.dataService.getFromStorage("sort_type");
    const sort = this.dataService.getFromStorage("sort");

    this.pagination.page = page;
    this.pagination.sort_type = sort_type;
    this.pagination.sort = sort;

    this.offsetPagination = page ? (page - 1) : 0;

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
    console.log(arguments);
    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);
  }

  setPage(pageInfo) {
    this.offsetPagination = pageInfo.offset;
    this.loadingIndicator = true;

    if (this.pagination['search']) {
      this.pagination.page = pageInfo.offset + 1;
    } else {
      this.dataService.setToStorage("page", pageInfo.offset + 1);
      this.pagination.page = this.dataService.getFromStorage("page");
    }

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

    this.dataService.setToStorage("page", this.pagination.page);
    this.dataService.setToStorage("sort", event.column.prop);
    this.dataService.setToStorage("sort_type", event.newValue);

    this.adminPrincipalService.get(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data;
      this.loadingIndicator = false;
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
      this.offsetPagination = page ? (page - 1) : 0;
    }

    this.adminPrincipalService.get(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data;
      this.loadingIndicator = false;
    });
  }

  deleteUser(id): void {
    this.id = id;
    let data = {
      titleDialog: this.ls.locale.admin_principal.text5,
      captionDialog: this.ls.locale.admin_principal.text6,
      confirmCallback: this.confirmDelete.bind(this),
      buttonText: [this.ls.locale.global.button.delete, this.ls.locale.global.button.cancel]
    };
    this.dialogService.openCustomConfirmationDialog(data);
  }

  confirmDelete() {
    this.adminPrincipalService.delete({ principal_id: this.id }).subscribe(
      res => {
        this.dialogService.brodcastCloseConfirmation();
        this.dialogService.openSnackBar({ message: this.ls.locale.global.messages.text1 });

        this.getAdminList();
        this.selected = [];
      },
      err => {
        this.dialogService.openSnackBar({ message: err.error.message });
      }
    );
  }

  deleteAllUser(): void {
    if (this.selected.length > 0) {
      let data = {
        titleDialog: this.ls.locale.admin_principal.text14,
        captionDialog: this.ls.locale.admin_principal.text15,
        confirmCallback: this.confirmAllDelete.bind(this),
        buttonText: [this.ls.locale.global.button.deactivate, this.ls.locale.global.button.cancel]
      };
      this.dialogService.openCustomConfirmationDialog(data);
    } else {
      this.dialogService.openSnackBar({ message: this.ls.locale.admin_principal.text16 })
    }
  }

  confirmAllDelete() {
    let body = {
      ids: this.selected.filter(item => item.status === 'active').map(item => item.id)
    }

    this.adminPrincipalService.deleteMultiple(body).subscribe(
      res => {
        this.dialogService.brodcastCloseConfirmation();
        this.dialogService.openSnackBar({ message: this.ls.locale.global.messages.text1 });

        this.getAdminList();
        this.selected = [];
      },
      err => {
        this.dialogService.openSnackBar({ message: err.error.message });
      }
    );
  }

  directEdit(param?: any): void {
    // this.dataService.setToStorage("detail_admin_principal", param);
    this.router.navigate(["user-management", "admin-principal", "edit", param.id]);
  }

  directDetail(param?: any): void {
    // this.dataService.setToStorage("detail_admin_principal", param);
    this.router.navigate(["user-management", "admin-principal", "detail", param.id]);
  }
}
