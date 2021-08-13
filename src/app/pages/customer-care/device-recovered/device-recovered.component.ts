import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { Page } from 'app/classes/laravel-pagination';
import { PagesName } from 'app/classes/pages-name';
import { DataService } from 'app/services/data.service';
import { DialogService } from 'app/services/dialog.service';
import { Observable, Subject } from 'rxjs';

@Component({
  selector: 'app-device-recovered',
  templateUrl: './device-recovered.component.html',
  styleUrls: ['./device-recovered.component.scss']
})
export class DeviceRecoveredComponent implements OnInit {

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

  roles: PagesName = new PagesName();
  permission: any;
  max_retailer: FormControl = new FormControl('');
  reasonRecovery: FormControl = new FormControl('');

  constructor(
    private router: Router,
    private dialogService: DialogService,
    private dataService: DataService,
    // private notificationService: NotificationService
  ) {
    this.onLoad = true;
    this.selected = [];

    this.permission = this.roles.getRoles('principal.popupnotification');
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
    this.getNotifList();
  }

  getNotifList() {
    this.pagination.sort = 'created_at';
    // this.notificationService.getPopup(this.pagination).subscribe(
    //   res => {
    //     Page.renderPagination(this.pagination, res);
    //     this.rows = res.data;
    //     this.onLoad = false;
    //     this.loadingIndicator = false;
    //   },
    //   err => {
    //     console.error(err);
    //     this.onLoad = false;
    //   }
    // );
  }

  onSelect({ selected }) {
    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);
  }

  setPage(pageInfo) {
    this.loadingIndicator = true;
    this.pagination.page = pageInfo.offset + 1;

    // this.notificationService.getPopup(this.pagination).subscribe(res => {
    //   Page.renderPagination(this.pagination, res);
    //   this.rows = res.data;
    //   this.loadingIndicator = false;
    // });
  }

  onSort(event) {
    this.pagination.sort = event.column.prop;
    this.pagination.sort_type = event.newValue;
    this.pagination.page = 1;
    this.loadingIndicator = true;

    console.log("check pagination", this.pagination);

    // this.notificationService.getPopup(this.pagination).subscribe(res => {
    //   Page.renderPagination(this.pagination, res);
    //   this.rows = res.data;
    //   this.loadingIndicator = false;
    // });
  }

  updateFilter(string) {
    this.loadingIndicator = true;
    this.table.offset = 0;
    this.pagination.search = string;
    this.pagination.page = 1;

    console.log(this.pagination);

    // this.notificationService.getPopup(this.pagination).subscribe(res => {
    //   Page.renderPagination(this.pagination, res);
    //   this.rows = res.data;
    //   this.loadingIndicator = false;
    // });
  }

  directEdit(param?: any): void {
    this.router.navigate(['notifications', 'popup-notification', 'edit', param.id]);
  }

  deletePopup(id) {
    this.id = id;
    let data = {
      titleDialog: "Hapus Popup Notifikasi",
      captionDialog: "Apakah anda yakin untuk menghapus popup notifikasi ini ?",
      confirmCallback: this.confirmDelete.bind(this),
      buttonText: ["Hapus", "Batal"]
    };
    this.dialogService.openCustomConfirmationDialog(data);
  }

  confirmDelete() {
    // this.notificationService.deletePopup({ popup_notif_id: this.id }).subscribe(res => {
    //   if (res.status) {
    //     this.dialogService.brodcastCloseConfirmation();
    //     this.getNotifList();

    //     this.dialogService.openSnackBar({ message: "Data Berhasil Dihapus" });
    //   }
    // });
  }
}
