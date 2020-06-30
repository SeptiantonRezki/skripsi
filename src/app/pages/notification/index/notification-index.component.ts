import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { Page } from 'app/classes/laravel-pagination';
import { Subject, Observable } from 'rxjs';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { DialogService } from 'app/services/dialog.service';
import { DataService } from 'app/services/data.service';
import { NotificationService } from 'app/services/notification.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-notification-index',
  templateUrl: './notification-index.component.html',
  styleUrls: ['./notification-index.component.scss']
})
export class NotificationIndexComponent {

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
    private notificationService: NotificationService
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
    this.getNotifList();
  }

  getNotifList() {
    this.pagination.sort = 'created_at';
    this.notificationService.get(this.pagination).subscribe(
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

    this.notificationService.get(this.pagination).subscribe(res => {
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

    this.notificationService.get(this.pagination).subscribe(res => {
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

    this.notificationService.get(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data;
      this.loadingIndicator = false;
    });
  }

  directEdit(param?: any): void {
    this.dataService.setToStorage("detail_notif", param);
    this.router.navigate(["/notifications", "push-notification", "detail", param.id]);
  }

  // deleteUser(id): void {
  //   this.id = id;
  //   let data = {
  //     titleDialog: "Hapus Admin Principal",
  //     captionDialog: "Apakah anda yakin untuk menghapus Admin Principal ini ?",
  //     confirmCallback: this.confirmDelete.bind(this),
  //     buttonText: ["Hapus", "Batal"]
  //   };
  //   this.dialogService.openCustomConfirmationDialog(data);
  // }

  // confirmDelete() {
  //   this.notificationService.delete({ principal_id: this.id }).subscribe(
  //     res => {
  //       this.dialogService.brodcastCloseConfirmation();
  //       this.dialogService.openSnackBar({ message: "Data Berhasil Dihapus" });

  //       this.getNotifList();
  //     },
  //     err => {
  //       this.dialogService.openSnackBar({ message: err.error.message });
  //     }
  //   );
  // }

}
