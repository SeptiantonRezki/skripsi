import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { Page } from 'app/classes/laravel-pagination';
import { Subject, Observable } from 'rxjs';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { PagesName } from 'app/classes/pages-name';
import { HttpClient } from '@angular/common/http';
import { FuseSplashScreenService } from '@fuse/services/splash-screen.service';
import { Router } from '@angular/router';
import { DialogService } from 'app/services/dialog.service';
import { DataService } from 'app/services/data.service';
import { CourierService } from 'app/services/delivery-management/courier.service';
import { LanguagesService } from 'app/services/languages/languages.service';

@Component({
  selector: 'app-courier-management',
  templateUrl: './courier-management.component.html',
  styleUrls: ['./courier-management.component.scss']
})
export class CourierManagementComponent implements OnInit {
  rows: any[];
  selected: any[];
  id: any[];
  statusRow: any;

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
    private courierManagementService: CourierService,
    private ls: LanguagesService
  ) {
    this.onLoad = true;
    // this.selected = [];

    this.permission = this.roles.getRoles('principal.delivery_courier');
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
    this.getCourierList();
  }

  getCourierList() {
    const page = this.dataService.getFromStorage("page");
    const sort_type = this.dataService.getFromStorage("sort_type");
    const sort = this.dataService.getFromStorage("sort");

    this.pagination.page = page;
    this.pagination.sort_type = sort_type;
    this.pagination.sort = sort;

    this.offsetPagination = page ? (page - 1) : 0;

    this.courierManagementService.get(this.pagination).subscribe(
      res => {
        Page.renderPagination(this.pagination, res.data);
        this.rows = res.data ? res.data.data : [];

        this.onLoad = false;
        this.loadingIndicator = false;
      },
      err => {
        console.error(err);
        this.onLoad = false;
      }
    );
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

    this.courierManagementService.get(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res.data);
      this.rows = res.data ? res.data.data : [];
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

    this.courierManagementService.get(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res.data);
      this.rows = res.data ? res.data.data : [];
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

    this.courierManagementService.get(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res.data);
      this.rows = res.data ? res.data.data : [];
      this.loadingIndicator = false;
    });
  }

  deleteUser(id): void {
    this.id = id;
    let data = {
      titleDialog: "Hapus Layanan Kurir",
      captionDialog: "Apakah anda yakin untuk menghapus Layanan Kurir ini ?",
      confirmCallback: this.confirmDelete.bind(this),
      buttonText: ["Hapus", "Batal"]
    };
    this.dialogService.openCustomConfirmationDialog(data);
  }

  confirmDelete() {
    this.courierManagementService.delete({ courier_id: this.id }).subscribe(
      res => {
        this.dialogService.brodcastCloseConfirmation();
        this.dialogService.openSnackBar({ message: "Data Berhasil Dihapus" });

        this.getCourierList();
        this.selected = [];
      },
      err => {
        this.dialogService.openSnackBar({ message: err.error.message });
      }
    );
  }

  directEdit(param?: any): void {
    // this.dataService.setToStorage("detail_admin_principal", param);
    this.router.navigate(["delivery", "courier", "edit", param.id]);
  }

  directDetail(param?: any): void {
    // this.dataService.setToStorage("detail_admin_principal", param);
    this.router.navigate(["delivery", "courier", "detail", param.id]);
  }

  updateStatus(row, status) {
    this.id = row.id;
    this.statusRow = status;
    let data = {
      titleDialog: "Ubah Status Kurir",
      captionDialog: "Apakah kamu yakin ingin mengubah status Kurir ini ?",
      confirmCallback: this.confirmUpdateStats.bind(this),
      orderDetail: true,
      buttonText: ["Ya, Lanjutkan", "Tidak, Batalkan"]
    };
    this.dialogService.openCustomConfirmationDialog(data);
  }

  confirmUpdateStats() {
    this.dataService.showLoading(true);
    this.courierManagementService.updateStatus({ courier_id: this.id }, { status: this.statusRow }).subscribe(res => {
      if (res && res.data) {
        this.dialogService.openSnackBar({
          message: "Berhasil mengubah status kurir"
        });
      }
      this.dialogService.brodcastCloseConfirmation();
      this.dataService.showLoading(false);
      this.getCourierList();
    }, err => {
      this.dataService.showLoading(false);
    })
  }
}
