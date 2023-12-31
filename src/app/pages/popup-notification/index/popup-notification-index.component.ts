import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { Page } from 'app/classes/laravel-pagination';
import { Subject, Observable } from 'rxjs';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { Router } from '@angular/router';
import { DialogService } from 'app/services/dialog.service';
import { DataService } from 'app/services/data.service';
import { NotificationService } from 'app/services/notification.service';
import { PagesName } from 'app/classes/pages-name';
import { LanguagesService } from 'app/services/languages/languages.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-popup-notification-index',
  templateUrl: './popup-notification-index.component.html',
  styleUrls: ['./popup-notification-index.component.scss']
})
export class PopupNotificationIndexComponent {

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
  pageName = this.translate.instant('notification.popup_notifikasi.page_name');
  entityParams = { entity: this.pageName }

  constructor(
    private router: Router,
    private dialogService: DialogService,
    private dataService: DataService,
    private notificationService: NotificationService,
    private ls: LanguagesService,
    private translate:TranslateService,
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
    // this._fuseSplashScreenService.show();
    // this.http.getPopup("api/ayo-b2b-user").subscribe((contacts: any) => {
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
    this.notificationService.getPopup(this.pagination).subscribe(
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

    this.notificationService.getPopup(this.pagination).subscribe(res => {
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

    this.notificationService.getPopup(this.pagination).subscribe(res => {
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

    this.notificationService.getPopup(this.pagination).subscribe(res => {
      Page.renderPagination(this.pagination, res);
      this.rows = res.data;
      this.loadingIndicator = false;
    });
  }

  directEdit(param?: any): void {
    this.router.navigate(['notifications', 'popup-notification', 'edit', param.id]);
  }

  deletePopup(id) {
    this.id = id;
    let data = {
      titleDialog: this.translate.instant('global.messages.delete_data', {
        entity: this.pageName
      }),
      captionDialog: this.translate.instant('global.messages.delete_confirm', {
        entity: this.pageName,
        index: ''
      }),
      confirmCallback: this.confirmDelete.bind(this),
      buttonText: [this.translate.instant('global.button.delete'), this.translate.instant('global.button.cancel')]
    };
    this.dialogService.openCustomConfirmationDialog(data);
  }

  confirmDelete() {
    this.notificationService.deletePopup({ popup_notif_id: this.id }).subscribe(res => {
      if (res.status) {
        this.dialogService.brodcastCloseConfirmation();
        this.getNotifList();

        this.dialogService.openSnackBar({ message: this.translate.instant('global.messages.text1') });
      }
    });
  }

  // checkRolePermission(row) {
  //   if (row.action !== 'new-product') return true;
  //   else if (row.action === 'new-product' && this.permission.new_product) return true;
  //   else if (row.action === 'new-product' && !this.permission.new_product) return false;
  //   else return true;
  // }

}
