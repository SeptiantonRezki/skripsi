import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { Page } from 'app/classes/laravel-pagination';
import { PagesName } from 'app/classes/pages-name';
import { Emitter } from 'app/helper/emitter.helper';
import { DataService } from 'app/services/data.service';
import { NotificationService } from 'app/services/notification.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-vendor-notification',
  templateUrl: './vendor-notification.component.html',
  styleUrls: ['./vendor-notification.component.scss']
})
export class VendorNotificationComponent implements OnInit {
  onLoad: boolean;

  loadingIndicator = true;
  pagination: Page = new Page();
  offsetPagination: any;

  @ViewChild(DatatableComponent)
  table: DatatableComponent;

  @ViewChild('activeCell')
  activeCellTemp: TemplateRef<any>;

  keyUp = new Subject<string>();

  permission: any;
  roles: PagesName = new PagesName();

  //-----
  dataNotifUpdate: any;
  selectedTab: number;
  isSelectedRows: boolean;
  allRowsSelected: boolean;

  isDirectDetail: boolean;
  dataDetail: any;
  selectedImage: any;
  selectedRowIds: any[];
  id: any;
  countNotifUpdate: number;

  constructor(
    private dataService: DataService,
    // private notificationsListService: NotificationsListService,
    private notificationService: NotificationService,
    private activatedRoute: ActivatedRoute,
    private emitter: Emitter,
    private router: Router,
    // private gtmService: GoogleTagManagerService
  ) {
    this.onLoad = true;
    this.selectedTab = 0;
    this.dataNotifUpdate = null;
    this.isSelectedRows = false;
    this.isDirectDetail = false;
    this.dataDetail = null;
    this.selectedImage = {};
    this.selectedRowIds = [];
    this.allRowsSelected = false;
    this.countNotifUpdate = 0;

    // this.activatedRoute.url.subscribe(params => {
    //   if (params.length > 0) {
    //     this.id = params[1].path;
    //     this.isDirectDetail = params[0].path === 'detail' ? true : false;
    //     this.onLoad = true;
    //     setTimeout(() => {
    //       if (this.dataDetail === null) {
    //         this.getDetailNotif(this.id);
    //       } else {
    //         this.onLoad = false;
    //       }
    //     }, 1500);
    //   }
    // });

    this.emitter.listenNotifDetailEmitter.subscribe((value: any) => {
      if (value.isDirectDetail) {
        this.convertJSONDetail(value.data);
        this.onLoad = false;
      }
      if (value.isUpdateNotif) {
        this.getNotifUpdateList();
      }
      if (value.isNotifOnCLick) {
        this.getNotifUpdateList();
      }
    });
  }

  ngOnInit() {
    const profile = this.dataService.getDecryptedProfile();
    if (!this.isDirectDetail) {
      this.getNotifUpdateList();
    }
  }

  getNotifUpdateList() {
    const sort_type = this.dataService.getFromStorage('sort_type');
    const sort = this.dataService.getFromStorage('sort');

    this.pagination.page = 1;
    this.pagination.sort_type = sort_type;
    this.pagination.sort = sort;
    // this.pagination.per_page = 20;
    this.offsetPagination = 0;

    this.notificationService.getListNotif(this.pagination).subscribe((response) => {
      this.dataNotifUpdate = response;
      this.countNotifUpdate = response.unread;
      this.onLoad = false;
      this.loadingIndicator = false;
      this.isSelectedRows = false;
      this.selectedRowIds = [];
      this.allRowsSelected = false;
    }, (err) => {
      console.log('err', err);
      this.onLoad = false;
      this.loadingIndicator = false;
    });
  }

  getDetailNotif(id: any) {
    // this.notificationsListService.getDetail({ id: id }).subscribe((response) => {
    //   this.convertJSONDetail(response.result);
    //   this.onLoad = false;
    //   this.loadingIndicator = false;
    // }, (err) => {
    //   console.log('err', err);
    //   this.onLoad = false;
    //   this.loadingIndicator = false;
    // });
  }

  onSelectedTabChange(index: number) {
    this.selectedTab = index;
    if (index === 0) {
      // this.openDialogChat('tab');
    } else {
      const item = {
        isActiveRoomChat: false,
        isCreate: false
      };
      // this.emitter.emitSelectedHelpTabQ(item);
    }
  }

  onRowsSelected(event: any) {
    this.allRowsSelected = event.allRowsSelected || false;
    if (event.isDirectDetail) {
      this.isDirectDetail = true;
      this.dataDetail = event.data;
      this.updateRead(event.data.id);
      this.dataNotifUpdate.result.data[event.index].status = 'read';
      if (this.countNotifUpdate > 0) {
        this.countNotifUpdate -= 1;
      }
      if (event.data.entity_type === 'image') {
        this.directToMultipleImages(event.data);
      }
    }
    if (event.isSelected) {
      if (event.data.length > 0) {
        this.selectedRowIds = event.data.map((item: any) => item.id);
        this.isSelectedRows = true;
      } else {
        this.selectedRowIds = [];
        this.isSelectedRows = false;
      }
    }
  }

  directToMultipleImages(detail: any) {
    if (detail.data.image_value && detail.data.image_value.length > 0) {
      this.selectedImage.url = detail.data.image_value[0];
      this.selectedImage.index = 0;
    }
  }

  prevImage() {
    if (this.selectedImage.index === 0) {
      this.selectedImage.index = this.dataDetail.data.image_value.length - 1;
      this.selectedImage.url = this.dataDetail.data.image_value[this.dataDetail.data.image_value.length - 1];
    } else {
      this.selectedImage.index -= 1;
      this.selectedImage.url = this.dataDetail.data.image_value[this.selectedImage.index];
    }
  }

  nextImage() {
    if (this.selectedImage.index === this.dataDetail.data.image_value.length - 1) {
      this.selectedImage.index = 0;
      this.selectedImage.url = this.dataDetail.data.image_value[0];
    } else {
      this.selectedImage.index += 1;
      this.selectedImage.url = this.dataDetail.data.image_value[this.selectedImage.index];
    }
  }

  updateBadge(id?: any[], all?: boolean) {
    let params = null;
    const fd = new FormData();
    if (all) {
      params = {
        _method: 'PUT',
        all: true
      };
      fd.append(`all`, 'true');
    } else {
      params = {
        _method: 'PUT',
        id: id
      };
      id.forEach((d, i) => fd.append(`id[${i}]`, d));
    }
    this.onLoad = true;
    this.loadingIndicator = true;
    // this.notificationsListService.updateBadge(fd).subscribe((response) => {
    //   this.getNotifUpdateList();
    //   this.emitter.emitNotifDetailEmitter({ isUpdateNotif: true });
    // }, (err) => {
    //   console.log('err', err);
    //   this.onLoad = false;
    //   this.loadingIndicator = false;
    // });
  }

  unreadBadge(id?: any[], all?: boolean) {
    let params = null;
    const fd = new FormData();
    if (all) {
      params = {
        _method: 'PUT',
        all: true
      };
      fd.append(`all`, 'true');
    } else {
      params = {
        _method: 'PUT',
        id: id
      };
      id.forEach((d, i) => fd.append(`id[${i}]`, d));
    }
    this.onLoad = true;
    this.loadingIndicator = true;
    // this.notificationsListService.unreadBadge(fd).subscribe((response) => {
    //   this.getNotifUpdateList();
    //   this.emitter.emitNotifDetailEmitter({ isUpdateNotif: true });
    // }, (err) => {
    //   console.log('err', err);
    //   this.onLoad = false;
    //   this.loadingIndicator = false;
    // });
  }

  removeNotif(id?: any[], all?: boolean) {
    let params = null;
    if (all) {
      params = {
        all: true
      };
    } else {
      params = {
        id: id
      };
    }
    this.onLoad = true;
    this.loadingIndicator = true;
    // this.notificationsListService.deleteBadge(params).subscribe((response) => {
    //   this.onLoad = false;
    //   this.loadingIndicator = false;
    //   this.getNotifUpdateList();
    // }, (err) => {
    //   console.log('err', err);
    //   this.onLoad = false;
    //   this.loadingIndicator = false;
    // });
  }

  updateBadgeBtn() {
    if (this.allRowsSelected) {
      this.updateBadge([], true);
    } else {
      if (this.selectedRowIds.length > 0) {
        this.updateBadge(this.selectedRowIds, false);
      }
    }
  }

  unreadBadgeBtn() {
    if (this.allRowsSelected) {
      this.unreadBadge([], true);
    } else {
      if (this.selectedRowIds.length > 0) {
        this.unreadBadge(this.selectedRowIds, false);
      }
    }
  }

  removeNotifBtn() {
    if (this.allRowsSelected) {
      this.removeNotif([], true);
    } else {
      if (this.selectedRowIds.length > 0) {
        this.removeNotif(this.selectedRowIds, false);
      }
    }
  }

  closeDetail() {
    this.isDirectDetail = false;
    this.router.navigate(['/list-notifications']);
    this.isDirectDetail = false;
  }

  updateRead(id: any) {
    this.notificationService.updateNotif(id).subscribe(res => {
      this.getNotifUpdateList();
      this.emitter.emitNotifDetailEmitter({ isUpdateNotif: true });
    });
  }

  async convertJSONDetail(value: any) {
    if (this.isJSONStringify(value.data)) {
      value.data = await JSON.parse(value.data);
      this.dataDetail = value;
      if (value.entity_type === 'image') {
        this.directToMultipleImages(value);
      }
    } else {
      this.dataDetail = value;
      if (value.entity_type === 'image') {
        this.directToMultipleImages(value);
      }
    }
    if (this.selectedTab === 0) {
      this.getNotifUpdateList();
    }
  }

  isJSONStringify(data: any) {
    // console.warn('isJSONStringify', data);
    try {
      JSON.parse(data);
    } catch (ex) {
      console.warn('ex', ex);
      return false;
    }
    return true;
  }

}
